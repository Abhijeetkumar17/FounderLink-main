package com.capgemini.notification.event;

import lombok.*;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StartupApprovedEvent implements Serializable {
    private Long startupId;
    private Long founderId;
    private String startupName;
}
