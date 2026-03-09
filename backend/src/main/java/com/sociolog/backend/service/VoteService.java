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

        // 1. Вземаме проучването (хвърля exception ако не съществува)
        Survey survey = surveyService.getById(surveyId);

        // 2. Проверяваме дали проучването е активно
        if (!survey.getIsActive()) {
            throw new RuntimeException("Survey is closed");
        }

        // 3. Генерираме анонимния хеш
        // SHA256(identifier + survey_salt + pepper)
        String voteHash = hashUtil.generateVoteHash(identifier, survey.getSalt());

        // 4. Проверяваме дали вече е гласувано с този хеш
        if (usedHashRepository.existsByHashAndSurveyId(voteHash, surveyId)) {
            throw new RuntimeException("Already voted");
        }

        // 5. Записваме хеша като "използван"
        UsedHash usedHash = UsedHash.builder()
                .hash(voteHash)
                .survey(survey)
                .trustLevel(trustLevel)
                .build();
        usedHashRepository.save(usedHash);

        // 6. Записваме гласа (БЕЗ никакви лични данни!)
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

    public long getTotalVotes(UUID surveyId) {
        return voteRepository.countBySurveyId(surveyId);
    }
}