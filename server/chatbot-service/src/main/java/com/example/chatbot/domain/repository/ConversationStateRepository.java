package com.example.chatbot.domain.repository;

import com.example.chatbot.domain.model.ConversationState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationStateRepository extends JpaRepository<ConversationState, Integer> {
    Optional<ConversationState> findByUserId(Integer userId);

    void deleteByUserId(Integer userId);
}
