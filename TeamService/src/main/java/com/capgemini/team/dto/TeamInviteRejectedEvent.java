package com.capgemini.team.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
