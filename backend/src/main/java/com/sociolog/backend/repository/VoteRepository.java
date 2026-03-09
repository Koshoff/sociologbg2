package com.sociolog.backend.repository;

import com.sociolog.backend.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VoteRepository extends JpaRepository<Vote, UUID> {

    /**
     * Брои гласовете по избор и ниво на доверие за дадено проучване.
     * Използваме @Query за по-сложни заявки.
     *
     * Резултатът е списък от масиви: [choice, trustLevel, count]
     * Например: ["ДА", 3, 142]
     */
    @Query("""
        SELECT v.choice, v.trustLevel, COUNT(v)
        FROM Vote v
        WHERE v.survey.id = :surveyId
        GROUP BY v.choice, v.trustLevel
        ORDER BY v.trustLevel DESC, v.choice ASC
    """)
    List<Object[]> countVotesBySurveyGrouped(@Param("surveyId") UUID surveyId);

    /**
     * Общ брой гласове за проучване по ниво на доверие.
     */
    Long countBySurveyIdAndTrustLevel(UUID surveyId, Integer trustLevel);

    long countBySurveyId(UUID surveyId);

}
