package com.capgemini.team.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key.team-invite-sent}")
    private String teamInviteSentRoutingKey;

    @Value("${rabbitmq.routing-key.team-invite-accepted}")
    private String teamInviteAcceptedRoutingKey;

    @Value("${rabbitmq.routing-key.team-invite-rejected}")
    private String teamInviteRejectedRoutingKey;

    public void publishTeamInviteSent(TeamInviteSentEvent event) {
        log.info("Publishing TEAM_INVITE_SENT event for invitation: {}", event.getInvitationId());
        rabbitTemplate.convertAndSend(exchange, teamInviteSentRoutingKey, event);
    }

    public void publishTeamInviteAccepted(com.capgemini.team.dto.TeamInviteAcceptedEvent event) {
        log.info("Publishing TEAM_INVITE_ACCEPTED event for invitation: {}", event.getInvitationId());
        rabbitTemplate.convertAndSend(exchange, teamInviteAcceptedRoutingKey, event);
    }

    public void publishTeamInviteRejected(com.capgemini.team.dto.TeamInviteRejectedEvent event) {
        log.info("Publishing TEAM_INVITE_REJECTED event for invitation: {}", event.getInvitationId());
        rabbitTemplate.convertAndSend(exchange, teamInviteRejectedRoutingKey, event);
    }
}
