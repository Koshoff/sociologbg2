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

     * @param region      Регион на потребителя (само град/регион, не IP)
     *
     * @Transactional гарантира че ако нещо се счупи по средата,
     * всички промени в базата се отменят (rollback).
     */
    @Transactional
    public Vote castVote(UUID surveyId, String choice, String identifier, String region) {

        Survey survey = surveyService.getById(surveyId);

        if (!survey.getIsActive()) {
            throw new RuntimeException("Survey is closed");
        }

        // Верифицираме Google токена и извличаме Google ID
        String googleId = googleAuthService.verifyAndGetGoogleId(identifier);
        if (googleId == null) {
            throw new RuntimeException("Invalid Google token");
        }

        String voteHash = hashUtil.generateVoteHash(googleId, survey.getSalt());

        if (usedHashRepository.existsByHashAndSurveyId(voteHash, surveyId)) {
            throw new RuntimeException("Already voted");
        }

        UsedHash usedHash = UsedHash.builder()
                .hash(voteHash)
                .survey(survey)
                .build();
        usedHashRepository.save(usedHash);

        Vote vote = Vote.builder()
                .survey(survey)
                .choice(choice)
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
     *   "total":    { "ДА": 432, "НЕ": 186 }      ← всички заедно
     * }
     */
    public Map<String, Map<String, Long>> getResults(UUID surveyId) {

        surveyService.getById(surveyId);

        List<Object[]> rawResults = voteRepository.countVotesBySurveyGrouped(surveyId);

        Map<String, Map<String, Long>> results = new LinkedHashMap<>();
        results.put("total", new LinkedHashMap<>());

        for (Object[] row : rawResults) {
            String choice = (String) row[0];
            Long count    = (Long)   row[1];

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