package com.sociolog.backend.service;

import com.sociolog.backend.entity.Survey;
import com.sociolog.backend.entity.UsedHash;
import com.sociolog.backend.entity.Vote;
import com.sociolog.backend.repository.UsedHashRepository;
import com.sociolog.backend.repository.VoteRepository;
import com.sociolog.backend.util.HashUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteRepository voteRepository;
    private final UsedHashRepository usedHashRepository;
    private final SurveyService surveyService;
    private final GoogleAuthService googleAuthService;
    private final HashUtil hashUtil;

    /**
     * Основният метод за гласуване.
     *
     * @param surveyId    ID на проучването
     * @param choice      Изборът на потребителя ("ДА", "НЕ" и т.н.)
     * @param identifier  Google ID или device fingerprint
     * @param trustLevel  1, 2 или 3
     * @param region      Регион на потребителя (само град/регион, не IP)
     *
     * @Transactional гарантира че ако нещо се счупи по средата,
     * всички промени в базата се отменят (rollback).
     */
    @Transactional
    public Vote castVote(UUID surveyId, String choice, String identifier,
                         Integer trustLevel, String region) {

        Survey survey = surveyService.getById(surveyId);

        if (!survey.getIsActive()) {
            throw new RuntimeException("Survey is closed");
        }

        // Ако е Google верификация — верифицираме токена и извличаме Google ID
        String resolvedIdentifier = identifier;
        if (trustLevel == 3) {
            String googleId = googleAuthService.verifyAndGetGoogleId(identifier);
            if (googleId == null) {
                throw new RuntimeException("Invalid Google token");
            }
            resolvedIdentifier = googleId;
        }

        String voteHash = hashUtil.generateVoteHash(resolvedIdentifier, survey.getSalt());

        if (usedHashRepository.existsByHashAndSurveyId(voteHash, surveyId)) {
            throw new RuntimeException("Already voted");
        }

        UsedHash usedHash = UsedHash.builder()
                .hash(voteHash)
                .survey(survey)
                .trustLevel(trustLevel)
                .build();
        usedHashRepository.save(usedHash);

        Vote vote = Vote.builder()
                .survey(survey)
                .choice(choice)
                .trustLevel(trustLevel)
                .region(region)
                .build();

        return voteRepository.save(vote);
    }

    /**
     * Връща резултатите за дадено проучване, разбити по ниво на доверие.
     *
     * Структурата на резултата:
     * {
     *   "verified": { "ДА": 142, "НЕ": 58 },      ← trustLevel 3
     *   "partial":  { "ДА": 89,  "НЕ": 31 },      ← trustLevel 2
     *   "anonymous":{ "ДА": 201, "НЕ": 97 },      ← trustLevel 1
     *   "total":    { "ДА": 432, "НЕ": 186 }      ← всички заедно
     * }
     */
    public Map<String, Map<String, Long>> getResults(UUID surveyId) {

        // Проверяваме дали проучването съществува
        surveyService.getById(surveyId);

        // Вземаме групираните резултати от базата
        List<Object[]> rawResults = voteRepository.countVotesBySurveyGrouped(surveyId);

        // Инициализираме структурата
        Map<String, Map<String, Long>> results = new LinkedHashMap<>();
        results.put("verified",  new LinkedHashMap<>());  // trustLevel 3
        results.put("partial",   new LinkedHashMap<>());  // trustLevel 2
        results.put("anonymous", new LinkedHashMap<>());  // trustLevel 1
        results.put("total",     new LinkedHashMap<>());  // всички

        // Обработваме суровите резултати
        // rawResults е списък от: [choice, trustLevel, count]
        for (Object[] row : rawResults) {
            String choice     = (String)  row[0];
            Integer trustLevel = (Integer) row[1];
            Long count        = (Long)    row[2];

            // Добавяме към правилната група
            String group = switch (trustLevel) {
                case 3 -> "verified";
                case 2 -> "partial";
                default -> "anonymous";
            };

            results.get(group).merge(choice, count, Long::sum);

            // Добавяме и към total
            results.get("total").merge(choice, count, Long::sum);
        }

        return results;
    }

    public List<Map<String, Object>> getTopSurveys(int limit) {
        return voteRepository.findTopSurveysByVoteCount(limit);
    }

    public long getTotalVotes(UUID surveyId) {
        return voteRepository.countBySurveyId(surveyId);
    }

    public long getTotalVotesAll() {
        return voteRepository.count();
    }
}