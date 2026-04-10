package com.capgemini.notification.event;

import lombok.*;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamInviteRejectedEvent implements Serializable {
    private Long invitationId;
    private Long startupId;
    private String startupName;
    private Long invitedUserId;
    private String invitedUserName;
    private Long founderId;
    private String role;
}
