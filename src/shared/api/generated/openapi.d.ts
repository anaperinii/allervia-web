export interface paths {
    "/account/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AccountController_getAccountContext"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/me/email-change": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AccountController_requestOwnEmailChange"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/me/password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AccountController_changePassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/update/stats/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["AccountController_updateUserStatus"];
        trace?: never;
    };
    "/admin/provisioning/organizations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ProvisioningController_provision"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/provisioning/organizations/{organizationId}/resend-invite": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ProvisioningController_resendInvite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/appointments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AppointmentsController_list"];
        put?: never;
        post: operations["AppointmentsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/appointments/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AppointmentsController_read"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["AppointmentsController_update"];
        trace?: never;
    };
    "/audit-logs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AuditController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/audit-logs/actor/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AuditController_listByActor"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/audit-logs/entity/{entityType}/{entityId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AuditController_listByEntity"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/csrf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SessionController_issueCsrfToken"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/email-change/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_emailChangeConfirm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/email-change/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_emailChangeVerify"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["SessionController_logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["SessionController_logoutAll"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/mfa/enroll": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["SessionController_enrollFactor"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/mfa/enroll/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["SessionController_confirmFactor"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/mfa/factors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SessionController_listFactors"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/mfa/factors/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["SessionController_revokeFactor"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/mfa/recovery-codes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["SessionController_regenerateRecoveryCodes"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/mfa/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["SessionController_verifySecondFactor"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/password-reset/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_passwordResetConfirm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/password-reset/request": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_passwordResetRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/password-reset/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AuthController_passwordResetVerify"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/reauthenticate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["SessionController_confirmIdentity"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SessionController_readSession"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/session/activity": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["SessionController_registerActivity"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["SessionController_listDevices"];
        put?: never;
        post: operations["SessionController_createSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/sessions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["SessionController_revokeDevice"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/contact-requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["PublicRequestsController_contact"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/demo-requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["PublicRequestsController_demo"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/doses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["DosesController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/doses/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["DosesController_read"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["DosesController_legacy"];
        trace?: never;
    };
    "/doses/{id}/administer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["DosesController_administer"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/doses/{id}/observations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["DosesController_addObservation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/doses/{id}/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["DosesController_preview"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/doses/{id}/retract": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["DosesController_retract"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/doses/{id}/scheduled": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["DosesController_edit"];
        trace?: never;
    };
    "/doses/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["DosesController_metrics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/doses/update/status/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["DosesController_legacyStatus"];
        trace?: never;
    };
    "/immunotherapies/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ImmunotherapiesController_findOneImmunotherapy"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["ImmunotherapiesController_updateImmunotherapy"];
        trace?: never;
    };
    "/immunotherapies/{id}/doses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ImmunotherapiesController_findAllDosesForImmunotherapy"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/immunotherapies/{id}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ImmunotherapiesController_clinicalHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/immunotherapies/{id}/lifecycle": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ImmunotherapiesController_lifecycleHistory"];
        put?: never;
        post: operations["ImmunotherapiesController_lifecycleCommand"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/immunotherapies/{id}/prescription/revision": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ImmunotherapiesController_revisePrescription"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/immunotherapies/{id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["ImmunotherapiesController_legacyStatus"];
        trace?: never;
    };
    "/immunotherapies/export": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ImmunotherapiesController_exportClinical"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/immunotherapies/list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ImmunotherapiesController_findAll"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/immunotherapies/patients/{patientId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ImmunotherapiesController_findAllForPatient"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/immunotherapies/record/{patientId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ImmunotherapiesController_readPatientRecord"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/immunotherapies/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ImmunotherapiesController_createImmunotherapy"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/immunotherapies/status-history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ImmunotherapiesController_readStatusHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/immunotherapies/type/{type}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ImmunotherapiesController_findAllForType"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/immunotherapies/types": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ImmunotherapiesController_listTypes"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["NotificationsController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/notifications/{id}/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["NotificationsController_markRead"];
        trace?: never;
    };
    "/notifications/outbox-status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["NotificationsController_outboxStatus"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/notifications/outbox/{id}/retry": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["NotificationsController_retryOutbox"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/notifications/preferences": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["NotificationsController_preferences"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["NotificationsController_setPreference"];
        trace?: never;
    };
    "/notifications/read-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["NotificationsController_markAllRead"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/onboarding/invites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["InviteController_createInvite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/onboarding/invites/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["InviteController_cancelInvite"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/onboarding/invites/{id}/resend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["InviteController_resendInvite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/onboarding/invites/context/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["InviteController_readContext"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/onboarding/invites/list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["InviteController_listInvites"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/onboarding/registration/{inviteToken}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["RegistrationController_completeRegistration"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organization/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["OrganizationController_findMyOrganization"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["OrganizationController_updateMyOrganization"];
        trace?: never;
    };
    "/patients": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PatientsController_findAll"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patients/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PatientsController_findOne"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patients/update/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["PatientsController_update"];
        trace?: never;
    };
    "/patients/update/status/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["PatientsController_updateStatus"];
        trace?: never;
    };
    "/professionals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ProfessionalsController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/professionals/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["ProfessionalsController_updateMember"];
        trace?: never;
    };
    "/professionals/{id}/access": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["ProfessionalsController_changeAccess"];
        trace?: never;
    };
    "/professionals/{id}/email-change": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ProfessionalsController_startEmailChange"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/professionals/email-change-requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ProfessionalsController_listPendingEmailChanges"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/professionals/email-change-requests/{id}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ProfessionalsController_approvePendingEmailChange"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/professionals/email-change-requests/{id}/reject": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ProfessionalsController_rejectPendingEmailChange"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/professionals/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ProfessionalsController_readOwnProfile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["ProfessionalsController_updateOwnProfile"];
        trace?: never;
    };
    "/roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["RolesController_grant"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/roles/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["RolesController_findOne"];
        put?: never;
        post?: never;
        delete: operations["RolesController_revoke"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/roles/professional/{professionalId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["RolesController_listByProfessional"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/support-requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PublicRequestsController_listSupport"];
        put?: never;
        post: operations["PublicRequestsController_support"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/treatment-protocols": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ProtocolCatalogController_list"];
        put?: never;
        post: operations["ProtocolCatalogController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/treatment-protocols/{id}/versions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ProtocolCatalogController_version"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/treatment-protocols/automation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ProtocolCatalogController_readSettings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["ProtocolCatalogController_settings"];
        trace?: never;
    };
    "/treatment-protocols/migration/inventory": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ProtocolCatalogController_inventory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/treatment-protocols/migration/origin-draft": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ProtocolCatalogController_origin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/treatment-protocols/migration/therapies/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ProtocolCatalogController_bind"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/treatment-protocols/versions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ProtocolCatalogController_read"];
        put?: never;
        post?: never;
        delete: operations["ProtocolCatalogController_discard"];
        options?: never;
        head?: never;
        patch: operations["ProtocolCatalogController_edit"];
        trace?: never;
    };
    "/treatment-protocols/versions/{id}/default": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ProtocolCatalogController_defaults"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/treatment-protocols/versions/{id}/publish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ProtocolCatalogController_publish"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/treatment-protocols/versions/{id}/retire": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ProtocolCatalogController_retire"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/treatment-protocols/versions/{id}/simulate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ProtocolCatalogController_simulate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AccountContextDto: {
            capabilities: string[];
            organization?: components["schemas"]["AccountOrganizationDto"] | null;
            professional?: components["schemas"]["AccountProfessionalDto"] | null;
            roles: ("ADMINISTRATOR" | "RECEPTIONIST" | "PHYSICIAN" | "NURSE")[];
            security: components["schemas"]["AccountSecurityDto"];
            user: components["schemas"]["AccountUserDto"];
        };
        AccountOrganizationDto: {
            automationEnabled: boolean;
            id: string;
            name: string;
            timeZone: string;
        };
        AccountProfessionalDto: {
            councilNumber: string | null;
            councilUf: string | null;
            fullName: string;
            id: string;
            phoneNumber: string;
            profession: "PHYSICIAN" | "NURSE" | "NURSING_TECHNICIAN" | "RECEPTIONIST";
        };
        AccountSecurityDto: {
            mfaEnabled: boolean;
            mfaRequired: boolean;
            sessionBased: boolean;
        };
        AccountUserDto: {
            createdAt: string;
            email: string;
            id: string;
            isActive: boolean;
            type: "PROFESSIONAL" | "PATIENT";
        };
        AdministerDoseDto: {
            administeredAt: string;
            administeredById?: string;
            administrationEndedAt?: string;
            betweenDosesReport: string;
            expectedRevision: number;
            expectedTherapyRevision: number;
            idempotencyKey: string;
            immediateConduct?: components["schemas"]["DoseImmediateConductDto"];
            observations?: components["schemas"]["DoseObservationDto"][];
            reason?: string;
            values: components["schemas"]["ConfiguredDoseValuesDto"];
        };
        AdministerDoseResponseDto: {
            dose: components["schemas"]["DoseRecordDto"];
            recommendation: components["schemas"]["DoseRecommendationRecommendedDto"] | components["schemas"]["DoseRecommendationEndOfSequenceDto"];
            successor: components["schemas"]["DoseRecordDto"] | null;
            therapyRevision: number;
        };
        AdministeredValuesInputDto: {
            concentration: string;
            concentrationUnit: "DILUTION_DENOMINATOR";
            intervalDays: number;
            phase?: "BUILD_UP" | "MAINTENANCE";
            route: "SUBCUTANEOUS";
            volume: string;
            volumeUnit: "mL";
        };
        AdminRequestEmailChangeDto: {
            channel: "email" | "whatsapp";
            newEmail: string;
        };
        AppointmentDoseDto: {
            id: string;
            scheduledAt: string;
            status: "SCHEDULED" | "ADMINISTERED_ON_SCHEDULE" | "ADMINISTERED_OFF_SCHEDULE" | "ENTERED_IN_ERROR";
        };
        AppointmentPageDto: {
            items: components["schemas"]["AppointmentResponseDto"][];
            page: number;
            pageSize: number;
            total: number;
        };
        AppointmentPatientDto: {
            fullName: string;
            id: string;
            phoneNumber: string;
        };
        AppointmentProfessionalDto: {
            fullName: string;
            id: string;
            profession: "PHYSICIAN" | "NURSE" | "NURSING_TECHNICIAN" | "RECEPTIONIST";
        };
        AppointmentResponseDto: {
            createdAt: string;
            dose: components["schemas"]["AppointmentDoseDto"] | null;
            doseId: string | null;
            endsAt: string;
            id: string;
            notes: string | null;
            organizationId: string;
            patient: components["schemas"]["AppointmentPatientDto"];
            patientId: string;
            professional: components["schemas"]["AppointmentProfessionalDto"] | null;
            professionalId: string | null;
            revision: number;
            startsAt: string;
            status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "MISSED";
            statusReason: string | null;
            title: string | null;
            updatedAt: string;
        };
        ApproveEmailChangeDto: {
            channel: "email" | "whatsapp";
        };
        AuditLogDto: {
            action: string;
            changedFields: string[];
            entityId: string;
            entityType: string;
            id: string;
            newValues: {
                [key: string]: unknown;
            } | null;
            oldValues: {
                [key: string]: unknown;
            } | null;
            organizationId: string;
            sessionId: string | null;
            timestamp: string;
            userId: string;
        };
        AutomationSettingsDto: {
            enabled: boolean;
            expectedRevision?: number;
            timeZone: string;
        };
        AutomationSettingsResultDto: {
            enabled: boolean;
            revision: number;
            timeZone: string;
        };
        AutomationSettingsViewDto: {
            defaults: components["schemas"]["ProtocolDefaultDto"][];
            enabled: boolean;
            revision: number;
            timeZone: string;
        };
        BindLegacyDryRunResultDto: {
            doseId: string;
            dryRun: true;
            historicalDosesUnchanged: boolean;
            stepId: string;
            therapyId: string;
        };
        BindLegacyProtocolDto: {
            dryRun: boolean;
            expectedRevision: number;
            prescription: components["schemas"]["ResolvedPrescriptionInputDto"];
            versionId: string;
        };
        BindLegacyResultDto: {
            alreadyBound: boolean;
            prescriptionId: string;
        };
        ChangePasswordDto: Record<string, never>;
        ChangePasswordResponseDto: {
            message: string;
        };
        ClinicalExportPageDto: {
            asOf: string;
            items: components["schemas"]["ClinicalExportRowDto"][];
            page: number;
            pageSize: number;
            total: number;
        };
        ClinicalExportRowDto: {
            administered: components["schemas"]["DoseValuesResponseDto"] | null;
            administeredAt: string | null;
            administeredBy: components["schemas"]["ExportAdministeredByDto"] | null;
            administrationEndedAt: string | null;
            doseId: string;
            immediateConduct: "MAINTAIN" | "REQUEST_PHYSICIAN_REVIEW" | "SUSPEND_TREATMENT" | null;
            patient: components["schemas"]["ExportPatientDto"];
            planned: components["schemas"]["DoseValuesResponseDto"] | null;
            prescription: components["schemas"]["ExportPrescriptionDto"] | null;
            scheduledAt: string;
            status: "SCHEDULED" | "ADMINISTERED_ON_SCHEDULE" | "ADMINISTERED_OFF_SCHEDULE" | "ENTERED_IN_ERROR";
            therapy: components["schemas"]["ExportTherapyDto"];
        };
        ClinicalHistoryEntryDto: {
            action: string;
            entityId: string;
            entityType: string;
            id: string;
            newValues: {
                [key: string]: unknown;
            } | null;
            oldValues: {
                [key: string]: unknown;
            } | null;
            timestamp: string;
            user: components["schemas"]["LifecycleAuthorDto"];
        };
        ClinicalHistoryResponseDto: {
            entries: components["schemas"]["ClinicalHistoryEntryDto"][];
            therapyId: string;
        };
        ConfiguredDoseValuesDto: {
            concentration: string;
            intervalDays: number;
            phase?: "BUILD_UP" | "MAINTENANCE";
            stepId?: string;
            volume: string;
        };
        ConfirmMfaEnrollmentDto: {
            code: string;
            credentialId: string;
        };
        ContactRequestDto: {
            email: string;
            message: string;
            name: string;
            organization?: string;
        };
        ContactRequestReceiptDto: {
            createdAt: string;
            id: string;
            received: boolean;
            status: "RECEIVED" | "HANDLED";
        };
        CreateAppointmentDto: {
            doseId?: string;
            endsAt: string;
            notes?: string;
            patientId: string;
            professionalId: string;
            startsAt: string;
            title?: string;
        };
        CreateImmunotherapyDto: {
            administrationRoute: "SUBCUTANEOUS" | "SUBLINGUAL";
            extract: string;
            idempotencyKey: string;
            immunoType: string;
            inductionStartDate: string;
            patient?: components["schemas"]["CreatePatientDto"];
            patientId?: string;
            protocolVersionId?: string;
            startingStepId: string;
            stepIds: string[];
            targetStepId: string;
        };
        CreateInviteDto: {
            email: string;
            fullName: string;
        };
        CreatePatientDto: {
            birthDate: string;
            cpf?: string;
            fullName: string;
            guardian?: components["schemas"]["GuardianDto"] | null;
            phoneNumber: string;
            responsiblePhysicianId: string;
            weightInKg: number;
        };
        CreateProfessionalRoleDto: {
            name: "ADMINISTRATOR" | "RECEPTIONIST" | "PHYSICIAN" | "NURSE";
            professionalId: string;
        };
        CreateProtocolDto: {
            definition: components["schemas"]["ProtocolDefinitionDto"];
            name: string;
        };
        CreateProtocolResultDto: {
            protocol: components["schemas"]["TreatmentProtocolSummaryDto"];
            version: components["schemas"]["ProtocolVersionDto"];
        };
        CreateProtocolVersionDto: {
            definition: components["schemas"]["ProtocolDefinitionDto"];
        };
        CsrfTokenResponseDto: {
            csrfToken: string;
        };
        DemoRequestDto: {
            email: string;
            lastName: string;
            name: string;
            phone: string;
            professionals: number;
            requestId: string;
            role: "doctor" | "clinic_manager" | "pharmacist" | "nurse" | "other";
            solution: "self" | "single_clinic" | "clinic_network";
            specialty: string;
        };
        DemoRequestReceiptDto: {
            createdAt: string;
            id: string;
            received: boolean;
        };
        DeviceSessionDto: {
            createdAt: string;
            current: boolean;
            expiresAt: string;
            id: string;
            lastInteractiveAt: string;
            userAgent: string | null;
        };
        DiscardDraftResultDto: {
            discardedVersionId: string;
            protocolRemoved: boolean;
        };
        DoseDetailResponseDto: {
            administeredAt: string | null;
            administeredById: string | null;
            administeredStepId: string | null;
            administeredValues: components["schemas"]["DoseValuesResponseDto"] | null;
            administrationEndedAt: string | null;
            allowedValues: components["schemas"]["ProtocolStepResponseDto"][];
            archivedAt: string | null;
            archivedById: string | null;
            betweenDosesReport: string;
            concentration: number;
            createdAt: string;
            createdById: string;
            id: string;
            immediateConduct: "MAINTAIN" | "REQUEST_PHYSICIAN_REVIEW" | "SUSPEND_TREATMENT" | null;
            immediateConductJustification: string | null;
            immunotherapy: components["schemas"]["DoseTherapyDto"];
            immunotherapyId: string;
            isArchived: boolean;
            migrationRequired: boolean;
            nextIntervalInDays: number;
            observationAddenda: components["schemas"]["DoseObservationAddendumResponseDto"][];
            observations: components["schemas"]["DoseObservationResponseDto"][];
            plannedStepId: string | null;
            plannedValues: components["schemas"]["DoseValuesResponseDto"] | null;
            prescriptionId: string | null;
            prescriptionRevision: number | null;
            protocolVersionId: string | null;
            recommendation: (components["schemas"]["DoseRecommendationRecommendedDto"] | components["schemas"]["DoseRecommendationEndOfSequenceDto"]) | null;
            revision: number;
            scheduledAt: string;
            sourceDoseId: string | null;
            status: "SCHEDULED" | "ADMINISTERED_ON_SCHEDULE" | "ADMINISTERED_OFF_SCHEDULE" | "ENTERED_IN_ERROR";
            therapyRevision: number;
            timeZone?: string | null;
            updatedAt: string;
            updatedById: string;
            volume: string;
        };
        DoseImmediateConductDto: {
            justification?: string;
            type: "MAINTAIN" | "REQUEST_PHYSICIAN_REVIEW" | "SUSPEND_TREATMENT";
        };
        DoseMetricsAdherenceDto: {
            denominator: number;
            numerator: number;
            ratio: number | null;
        };
        DoseMetricsApplicationsDto: {
            byDay: components["schemas"]["DoseMetricsByDayDto"][];
            offSchedule: number;
            onSchedule: number;
            total: number;
        };
        DoseMetricsByDayDto: {
            count: number;
            day: string;
        };
        DoseMetricsResponseDto: {
            adherence: components["schemas"]["DoseMetricsAdherenceDto"];
            applications: components["schemas"]["DoseMetricsApplicationsDto"];
            from: string;
            scheduled: components["schemas"]["DoseMetricsScheduledDto"];
            therapies: components["schemas"]["DoseMetricsTherapiesDto"];
            timeZone: string;
            to: string;
        };
        DoseMetricsScheduledDto: {
            overdue: number;
            pending: number;
        };
        DoseMetricsTherapiesDto: {
            buildUp: number;
            completed: number;
            inProgress: number;
            maintenance: number;
            suspended: number;
        };
        DoseObservationAddendumResponseDto: {
            administeredMedications: string[];
            conduct: "MAINTAIN" | "REQUEST_PHYSICIAN_REVIEW" | "SUSPEND_TREATMENT" | null;
            conductJustification: string | null;
            createdAt: string;
            createdById: string;
            doseId: string;
            id: string;
            notes: string | null;
            observedAt: string;
            reportedSideEffects: string[];
        };
        DoseObservationDto: {
            administeredMedications: string[];
            notes?: string;
            phase: "PRE_ADMINISTRATION" | "POST_ADMINISTRATION";
            reportedSideEffects: string[];
        };
        DoseObservationResponseDto: {
            administeredMedications: string[];
            createdAt: string;
            doseId: string;
            id: string;
            notes: string | null;
            phase: "PRE_ADMINISTRATION" | "POST_ADMINISTRATION";
            reportedSideEffects: string[];
            updatedAt: string;
        };
        DosePrescriptionDto: {
            createdAt: string;
            createdById: string;
            id: string;
            immunotherapyId: string;
            organizationId: string;
            resolved: components["schemas"]["DoseResolvedPrescriptionDto"];
            revision: number;
            revisionReason: string | null;
            version: components["schemas"]["DoseProtocolVersionDto"];
            versionId: string;
        };
        DosePreviewDto: {
            administeredAt: string;
            expectedRevision: number;
            expectedTherapyRevision: number;
            values: components["schemas"]["ConfiguredDoseValuesDto"];
        };
        DosePreviewResponseDto: {
            allowedValues: components["schemas"]["ProtocolStepResponseDto"][];
            expectedRevision: number;
            expectedTherapyRevision: number;
            nextScheduledAt: string | null;
            prescriptionRevision: number;
            protocolVersionId: string;
            recommendation: components["schemas"]["DoseRecommendationRecommendedDto"] | components["schemas"]["DoseRecommendationEndOfSequenceDto"];
        };
        DoseProtocolVersionDto: {
            createdAt: string;
            createdById: string;
            definition: {
                [key: string]: unknown;
            };
            engineVersion: string;
            id: string;
            number: number;
            organizationId: string;
            protocolId: string;
            publishedAt: string | null;
            publishedById: string | null;
            revision: number;
            schemaVersion: number;
            status: "DRAFT" | "PUBLISHED" | "RETIRED";
        };
        DoseRecommendationEndOfSequenceDto: {
            fromStepId: string;
            kind: "END_OF_SEQUENCE";
            protocolVersionId: string;
        };
        DoseRecommendationRecommendedDto: {
            fromStepId: string;
            kind: "RECOMMENDED";
            label: string;
            phase: "BUILD_UP" | "MAINTENANCE";
            protocolVersionId: string;
            stepId: string;
            values: components["schemas"]["DoseValuesResponseDto"];
        };
        DoseRecordDto: {
            administeredAt: string | null;
            administeredById: string | null;
            administeredStepId: string | null;
            administeredValues: components["schemas"]["DoseValuesResponseDto"] | null;
            administrationEndedAt: string | null;
            archivedAt: string | null;
            archivedById: string | null;
            betweenDosesReport: string;
            concentration: number;
            createdAt: string;
            createdById: string;
            id: string;
            immediateConduct: "MAINTAIN" | "REQUEST_PHYSICIAN_REVIEW" | "SUSPEND_TREATMENT" | null;
            immediateConductJustification: string | null;
            immunotherapyId: string;
            isArchived: boolean;
            nextIntervalInDays: number;
            plannedStepId: string | null;
            plannedValues: components["schemas"]["DoseValuesResponseDto"] | null;
            prescriptionId: string | null;
            recommendation: (components["schemas"]["DoseRecommendationRecommendedDto"] | components["schemas"]["DoseRecommendationEndOfSequenceDto"]) | null;
            revision: number;
            scheduledAt: string;
            sourceDoseId: string | null;
            status: "SCHEDULED" | "ADMINISTERED_ON_SCHEDULE" | "ADMINISTERED_OFF_SCHEDULE" | "ENTERED_IN_ERROR";
            timeZone?: string | null;
            updatedAt: string;
            updatedById: string;
            volume: string;
        };
        DoseResolvedPrescriptionDto: {
            protocolId: string;
            protocolVersionId: string;
            route: "SUBCUTANEOUS";
            startingStepId: string;
            stepIds: string[];
            targetStepId: string;
            timeZone: string;
        };
        DoseResponseDto: {
            administeredAt: string | null;
            administeredById: string | null;
            administeredStepId?: string | null;
            administeredValues?: Record<string, never> | null;
            administrationEndedAt?: string | null;
            archivedAt: string | null;
            archivedById: string | null;
            betweenDosesReport: string;
            concentration: number;
            createdAt: string;
            createdById: string;
            id: string;
            immediateConduct?: "MAINTAIN" | "REQUEST_PHYSICIAN_REVIEW" | "SUSPEND_TREATMENT" | null;
            immediateConductJustification?: string | null;
            immunotherapyId: string;
            isArchived: boolean;
            nextIntervalInDays: number;
            plannedStepId?: string | null;
            plannedValues?: Record<string, never> | null;
            prescriptionId?: string | null;
            recommendation?: Record<string, never> | null;
            revision: number;
            scheduledAt: string;
            status: "SCHEDULED" | "ADMINISTERED_ON_SCHEDULE" | "ADMINISTERED_OFF_SCHEDULE" | "ENTERED_IN_ERROR";
            timeZone?: string | null;
            updatedAt: string;
            updatedById: string;
            volume: string;
        };
        DoseTherapyDto: {
            administrationRoute: "SUBCUTANEOUS" | "SUBLINGUAL";
            archivedAt: string | null;
            archivedById: string | null;
            createdAt: string;
            createdById: string;
            currentPrescription: components["schemas"]["DosePrescriptionDto"] | null;
            currentPrescriptionId: string | null;
            extract: string;
            id: string;
            immunoType: string;
            inductionStartDate: string;
            isArchived: boolean;
            maintenanceStartDate: string | null;
            patientId: string;
            revision: number;
            status: "IN_PROGRESS" | "SUSPENDED" | "COMPLETED";
            targetConcentration: number;
            targetVolume: string;
            updatedAt: string;
            updatedById: string;
        };
        DoseValuesResponseDto: {
            concentration: string;
            concentrationUnit: "DILUTION_DENOMINATOR";
            intervalDays: number;
            phase: "BUILD_UP" | "MAINTENANCE";
            route: "SUBCUTANEOUS";
            volume: string;
            volumeUnit: "mL";
        };
        EditProtocolVersionDto: {
            definition: components["schemas"]["ProtocolDefinitionDto"];
            expectedRevision: number;
        };
        EmailChangeConfirmDTO: Record<string, never>;
        EmailChangeMessageResponseDto: {
            message: string;
        };
        EmailChangeRequestDto: {
            currentEmail: string;
            decidedAt?: string | null;
            expiresAt: string;
            id: string;
            newEmail: string;
            professionalId: string;
            professionalName: string;
            requestedAt: string;
            status: "PENDING" | "DISPATCHED" | "CONFIRMED" | "REJECTED" | "SUPERSEDED" | "EXPIRED";
            whatsappUrl?: string;
        };
        EmailChangeRequestPageDto: {
            items: components["schemas"]["EmailChangeRequestDto"][];
            page: number;
            pageSize: number;
            pending: number;
            total: number;
        };
        EmailChangeVerifyDTO: Record<string, never>;
        EmailChangeVerifyResponseDto: {
            newEmail: string;
            valid: boolean;
        };
        EnrollMfaDto: {
            label?: string;
        };
        ExportAdministeredByDto: {
            fullName: string | null;
            id: string;
        };
        ExportPatientDto: {
            fullName: string;
            id: string;
            isActive: boolean;
            responsiblePhysician: components["schemas"]["ProfessionalRefDto"];
        };
        ExportPrescriptionDto: {
            protocolName: string;
            timeZone: string | null;
            versionId: string;
            versionNumber: number;
        };
        ExportTherapyDto: {
            administrationRoute: "SUBCUTANEOUS" | "SUBLINGUAL";
            extract: string;
            id: string;
            immunoType: string;
            inductionStartDate: string;
            status: "IN_PROGRESS" | "SUSPENDED" | "COMPLETED";
        };
        GuardianDto: {
            cpf?: string;
            fullName: string;
            phoneNumber: string;
        };
        ImmunotherapyDetailDto: {
            administrationRoute: "SUBCUTANEOUS" | "SUBLINGUAL";
            createdAt: string;
            currentPhase: "BUILD_UP" | "MAINTENANCE";
            doseCount: number;
            extract: string;
            id: string;
            immunoType: string;
            inductionStartDate: string;
            isArchived: boolean;
            maintenanceStartDate: string | null;
            nextDose?: components["schemas"]["TherapyNextDoseDto"] | null;
            patient: components["schemas"]["TherapyPatientRefDto"];
            prescription?: components["schemas"]["TherapyPrescriptionDetailDto"] | null;
            responsiblePhysician: components["schemas"]["TherapyPhysicianRefDto"];
            revision: number;
            status: "IN_PROGRESS" | "SUSPENDED" | "COMPLETED";
            updatedAt: string;
        };
        ImmunotherapyListItemDto: {
            administrationRoute: "SUBCUTANEOUS" | "SUBLINGUAL";
            createdAt: string;
            currentPhase: "BUILD_UP" | "MAINTENANCE";
            extract: string;
            id: string;
            immunoType: string;
            inductionStartDate: string;
            maintenanceStartDate: string | null;
            nextDose?: components["schemas"]["TherapyNextDoseDto"] | null;
            patient: components["schemas"]["TherapyPatientRefDto"];
            prescription?: components["schemas"]["TherapyPrescriptionRefDto"] | null;
            responsiblePhysician: components["schemas"]["TherapyPhysicianRefDto"];
            revision: number;
            status: "IN_PROGRESS" | "SUSPENDED" | "COMPLETED";
        };
        ImmunotherapyRegistrationResponseDto: {
            firstDose: components["schemas"]["DoseResponseDto"];
            immunotherapy: components["schemas"]["RegisteredImmunotherapyDto"];
            patient: components["schemas"]["RegisteredPatientDto"];
        };
        ImmunotherapyResponseDto: {
            administrationRoute: "SUBCUTANEOUS" | "SUBLINGUAL";
            archivedAt: string | null;
            archivedById: string | null;
            createdAt: string;
            createdById: string;
            currentPrescriptionId?: string | null;
            extract: string;
            id: string;
            immunoType: string;
            inductionStartDate: string;
            isArchived: boolean;
            maintenanceStartDate: string | null;
            patientId: string;
            prescription?: components["schemas"]["PrescriptionSnapshotDto"] | null;
            revision?: number;
            status: "IN_PROGRESS" | "SUSPENDED" | "COMPLETED";
            targetConcentration: number;
            targetVolume: string;
            updatedAt: string;
            updatedById: string | null;
        };
        InviteContextDto: {
            email: string;
            expiresAt: string;
            fullName: string;
            organizationName: string;
            role: "ADMINISTRATOR" | "RECEPTIONIST" | "PHYSICIAN" | "NURSE";
        };
        InviteCreatedByDto: {
            email: string;
            id: string;
        };
        InvitePageDto: {
            items: components["schemas"]["InviteResponseDto"][];
            page: number;
            pageSize: number;
            total: number;
        };
        InviteResponseDto: {
            createdAt: string;
            createdBy?: components["schemas"]["InviteCreatedByDto"];
            email: string;
            emailDelivered?: boolean;
            expiresAt: string;
            fullName: string;
            id: string;
            reissued?: boolean;
            role: "ADMINISTRATOR" | "RECEPTIONIST" | "PHYSICIAN" | "NURSE";
            status: "ACTIVE" | "EXPIRED" | "USED" | "CANCELLED";
            usedAt: string | null;
        };
        LateObservationDto: {
            administeredMedications: string[];
            conduct?: components["schemas"]["DoseImmediateConductDto"];
            expectedTherapyRevision: number;
            idempotencyKey?: string;
            notes?: string;
            observedAt: string;
            reportedSideEffects: string[];
        };
        LateObservationResponseDto: {
            addendum: components["schemas"]["DoseObservationAddendumResponseDto"];
            suspensionEventId: string | null;
        };
        LifecycleAuthorDto: {
            id: string;
            professional: components["schemas"]["ProfessionalRefDto"] | null;
        };
        LifecycleRecommendationsDto: {
            custom?: string[];
            environmentalControl?: boolean;
            monitoringSchedule?: string;
            note?: string;
            rescueMedication?: boolean;
            retesting?: boolean;
            warningSigns?: string;
        };
        MarkAllReadResponseDto: {
            marked: number;
        };
        MemberAccessStatusDto: {
            isActive: boolean;
            professionalId: string;
            userId: string;
        };
        MfaChallengeDto: {
            challengeToken: string;
            expiresAt: string;
            status: "MFA_REQUIRED";
        };
        MfaEnrollmentChallengeDto: {
            challengeToken: string;
            enrollment: components["schemas"]["MfaEnrollmentStartDto"];
            expiresAt: string;
            status: "MFA_ENROLLMENT_REQUIRED";
        };
        MfaEnrollmentStartDto: {
            credentialId: string;
            keyUri: string;
            secret: string;
        };
        MfaFactorDto: {
            confirmed: boolean;
            id: string;
            label: string;
        };
        MfaFactorsResponseDto: {
            factors: components["schemas"]["MfaFactorDto"][];
            recoveryCodesRemaining: number;
        };
        MfaVerifiedSessionDto: {
            authenticated: true;
            csrfToken: string;
            recoveryCodes?: string[];
            session: components["schemas"]["SessionStateDto"];
        };
        MigrationDecimalDto: {
            decimalText: string;
            doseId: string;
            exactCandidate: boolean;
            historicalRecordUnchanged: boolean;
            storedVolumeText: string;
        };
        MigrationInventoryDto: {
            dryRun: boolean;
            originDraft: components["schemas"]["OriginDraftDefinitionDto"];
            report: components["schemas"]["MigrationTherapyReportDto"][];
        };
        MigrationPatientRefDto: {
            fullName: string;
            id: string;
            isActive: boolean;
        };
        MigrationPendingDoseDto: {
            concentration: string;
            id: string;
            intervalDays: number;
            scheduledAt: string;
            volume: string;
        };
        MigrationTargetDto: {
            concentration: string;
            volume: string;
        };
        MigrationTherapyReportDto: {
            administrationRoute: "SUBCUTANEOUS" | "SUBLINGUAL";
            decimals: components["schemas"]["MigrationDecimalDto"][];
            extract: string;
            immunoType: string;
            inductionStartDate: string;
            issues: string[];
            patient: components["schemas"]["MigrationPatientRefDto"];
            pendingDoseIds: string[];
            pendingDoses: components["schemas"]["MigrationPendingDoseDto"][];
            prescriptionId: string | null;
            revision: number;
            status: "IN_PROGRESS" | "SUSPENDED" | "COMPLETED";
            target: components["schemas"]["MigrationTargetDto"];
            therapyId: string;
        };
        NotificationDto: {
            body: string;
            createdAt: string;
            entityId: string | null;
            entityType: string | null;
            id: string;
            kind: "PHYSICIAN_REVIEW_REQUESTED" | "TREATMENT_SUSPENDED" | "EMAIL_CHANGE_REQUEST_PENDING" | "EMAIL_CHANGE_REQUEST_DECIDED";
            organizationId: string;
            outboxEventId: string;
            readAt: string | null;
            title: string;
            userId: string;
        };
        NotificationPageDto: {
            items: components["schemas"]["NotificationDto"][];
            page: number;
            pageSize: number;
            total: number;
            unread: number;
        };
        NotificationPreferenceDto: {
            enabled: boolean;
            kind: "PHYSICIAN_REVIEW_REQUESTED" | "TREATMENT_SUSPENDED" | "EMAIL_CHANGE_REQUEST_PENDING" | "EMAIL_CHANGE_REQUEST_DECIDED";
        };
        OrganizationResponseDto: {
            automationEnabled: boolean;
            createdAt: string;
            id: string;
            isActive: boolean;
            name: string;
            revision: number;
            taxId: string;
            timeZone: string;
            updatedAt: string;
        };
        OriginDraftDefinitionDto: {
            concentrationUnit: "DILUTION_DENOMINATOR";
            engineVersion: "1";
            provenance: "LEGACY_INVENTORY_NOT_CLINICALLY_APPROVED";
            requiresClinicalTransitionReview: boolean;
            route: "SUBCUTANEOUS";
            schemaVersion: 1;
            steps: components["schemas"]["OriginDraftStepDto"][];
            volumeUnit: "mL";
        };
        OriginDraftStepDto: {
            concentration: string;
            id: string;
            intervalDays: number;
            label: string;
            nextStepId: string | null;
            phase: "BUILD_UP" | "MAINTENANCE";
            volume: string;
        };
        OutboxFailureDto: {
            attempts: number;
            createdAt: string;
            id: string;
            kind: "PHYSICIAN_REVIEW_REQUESTED" | "TREATMENT_SUSPENDED" | "EMAIL_CHANGE_REQUEST_PENDING" | "EMAIL_CHANGE_REQUEST_DECIDED";
            lastError: string | null;
            processedAt: string | null;
        };
        OutboxRetryResponseDto: {
            id: string;
            requeued: boolean;
        };
        OutboxStatusDto: {
            deadLettered: number;
            lastFailures: components["schemas"]["OutboxFailureDto"][];
            pending: number;
        };
        PageDto: {
            items: unknown[][];
            page: number;
            pageSize: number;
            total: number;
        };
        PasswordResetConfirmDTO: Record<string, never>;
        PasswordResetMessageResponseDto: {
            message: string;
        };
        PasswordResetRequestDTO: Record<string, never>;
        PasswordResetVerifyDTO: Record<string, never>;
        PasswordResetVerifyResponseDto: {
            valid: boolean;
        };
        PatientClinicalRecordDto: {
            appointments: {
                [key: string]: unknown;
            }[];
            asOf: string;
            complete: boolean;
            history: {
                [key: string]: unknown;
            }[];
            patient: {
                [key: string]: unknown;
            };
            redactedFields: string[];
            therapies: {
                [key: string]: unknown;
            }[];
        };
        PatientDetailDto: {
            birthDate: string;
            cpf?: string | null;
            cpfMasked: string | null;
            createdAt: string;
            fullName: string;
            guardian: components["schemas"]["PatientGuardianDto"] | null;
            id: string;
            isActive: boolean;
            phoneNumber: string;
            responsiblePhysician: components["schemas"]["ResponsiblePhysicianDto"];
            therapies: components["schemas"]["TherapySummaryDto"][];
            therapyCount: number;
            therapyStatuses: ("IN_PROGRESS" | "SUSPENDED" | "COMPLETED")[];
            updatedAt: string;
            weightInKg: number;
        };
        PatientGuardianDto: {
            cpf: string | null;
            fullName: string;
            phoneNumber: string;
        };
        PatientListItemDto: {
            birthDate: string;
            cpfMasked: string | null;
            createdAt: string;
            fullName: string;
            id: string;
            isActive: boolean;
            phoneNumber: string;
            responsiblePhysician: components["schemas"]["ResponsiblePhysicianDto"];
            therapyCount: number;
            therapyStatuses: ("IN_PROGRESS" | "SUSPENDED" | "COMPLETED")[];
            weightInKg: number;
        };
        PatientListPageDto: {
            items: components["schemas"]["PatientListItemDto"][];
            page: number;
            pageSize: number;
            total: number;
        };
        PatientResponseDto: {
            archivedAt: string | null;
            archivedById: string | null;
            birthDate: string;
            cpf: string | null;
            createdAt: string;
            createdById: string;
            fullName: string;
            guardianCpf: string | null;
            guardianName: string | null;
            guardianPhoneNumber: string | null;
            id: string;
            isActive: boolean;
            isArchived: boolean;
            organizationId: string;
            phoneNumber: string;
            responsiblePhysicianId: string;
            updatedAt: string;
            updatedById: string;
            userId: string | null;
            weightInKg: number;
        };
        PrescriptionRevisionAppliedDto: {
            dryRun: false;
            pendingDose: components["schemas"]["DoseResponseDto"];
            prescriptionId: string;
            previousPrescriptionId: string;
            therapyRevision: number;
        };
        PrescriptionRevisionDto: {
            dryRun: boolean;
            expectedRevision: number;
            idempotencyKey?: string;
            pendingStepId: string;
            prescription: components["schemas"]["ResolvedPrescriptionInputDto"];
            reason: string;
            targetVersionId: string;
        };
        PrescriptionRevisionPreviewDto: {
            dryRun: true;
            historicalDosesUnchanged: boolean;
            pendingDoseId: string;
            pendingStep: components["schemas"]["RevisionPendingStepDto"];
            previousVersionId: string;
            scheduledAtUnchanged: string;
            targetVersionId: string;
            therapyId: string;
        };
        PrescriptionSnapshotDto: {
            createdAt: string;
            createdById: string;
            id: string;
            immunotherapyId: string;
            organizationId: string;
            resolved: Record<string, never>;
            revision: number;
            revisionReason: string | null;
            versionId: string;
        };
        ProfessionalRefDto: {
            fullName: string;
            id: string;
        };
        ProfessionalResponseDto: {
            councilNumber: string | null;
            councilUf: string | null;
            createdAt: string;
            fullName: string;
            id: string;
            organizationId: string;
            phoneNumber: string;
            profession: "PHYSICIAN" | "NURSE" | "NURSING_TECHNICIAN" | "RECEPTIONIST";
            updatedAt: string;
            userId: string;
        };
        ProfileInternalUserDto: {
            fullName: string;
            password: string;
            phoneNumber: string;
            profession: "PHYSICIAN" | "NURSE" | "NURSING_TECHNICIAN" | "RECEPTIONIST";
        };
        ProtocolDefaultDto: {
            organizationId: string;
            route: "SUBCUTANEOUS" | "SUBLINGUAL";
            versionId: string;
        };
        ProtocolDefinitionDto: {
            concentrationUnit: "DILUTION_DENOMINATOR";
            engineVersion: "1";
            route: "SUBCUTANEOUS";
            schemaVersion: 1;
            steps: components["schemas"]["ProtocolStepDefinitionDto"][];
            volumeUnit: "mL";
        };
        ProtocolRevisionDto: {
            expectedRevision: number;
        };
        ProtocolStepDefinitionDto: {
            concentration: string;
            id: string;
            intervalDays: number;
            label: string;
            nextStepId: string | null;
            phase: "BUILD_UP" | "MAINTENANCE";
            volume: string;
        };
        ProtocolStepResponseDto: {
            concentration: string;
            id: string;
            intervalDays: number;
            label: string;
            nextStepId: string | null;
            phase: "BUILD_UP" | "MAINTENANCE";
            volume: string;
        };
        ProtocolVersionDto: {
            createdAt: string;
            createdById: string;
            definition: components["schemas"]["ProtocolDefinitionDto"];
            engineVersion: string;
            id: string;
            number: number;
            organizationId: string;
            protocolId: string;
            publishedAt: string | null;
            publishedById: string | null;
            revision: number;
            schemaVersion: number;
            status: "DRAFT" | "PUBLISHED" | "RETIRED";
        };
        ProvisionedAdministratorInviteDto: {
            email: string;
            expiresAt: string;
            id: string;
            role: "ADMINISTRATOR" | "RECEPTIONIST" | "PHYSICIAN" | "NURSE";
        };
        ProvisionedOrganizationDto: {
            administratorInvite: components["schemas"]["ProvisionedAdministratorInviteDto"];
            inviteEmailDelivered: boolean;
            organization: components["schemas"]["ProvisionedOrganizationSummaryDto"];
        };
        ProvisionedOrganizationSummaryDto: {
            id: string;
            name: string;
            taxId: string;
        };
        ProvisionOrganizationAdministratorDto: {
            email: string;
            fullName: string;
        };
        ProvisionOrganizationDto: {
            administrator: components["schemas"]["ProvisionOrganizationAdministratorDto"];
            organization: components["schemas"]["ProvisionOrganizationOrganizationDto"];
        };
        ProvisionOrganizationOrganizationDto: {
            name: string;
            taxId: string;
        };
        ReauthenticateDto: {
            code?: string;
            password: string;
        };
        ReauthenticationResponseDto: {
            maxAgeSeconds: number;
            reauthenticatedAt: string;
        };
        RecoveryCodesDto: {
            recoveryCodes: string[];
        };
        RegisteredImmunotherapyDto: {
            administrationRoute: "SUBCUTANEOUS" | "SUBLINGUAL";
            archivedAt: string | null;
            archivedById: string | null;
            createdAt: string;
            createdById: string;
            currentPrescriptionId: string | null;
            extract: string;
            id: string;
            immunoType: string;
            inductionStartDate: string;
            isArchived: boolean;
            maintenanceStartDate: string | null;
            patientId: string;
            prescription: components["schemas"]["PrescriptionSnapshotDto"];
            revision: number;
            status: "IN_PROGRESS" | "SUSPENDED" | "COMPLETED";
            targetConcentration: number;
            targetVolume: string;
            updatedAt: string;
            updatedById: string;
        };
        RegisteredPatientDto: {
            archivedAt: string | null;
            archivedById: string | null;
            birthDate: string;
            cpf: string | null;
            createdAt: string;
            createdById: string;
            fullName: string;
            guardianCpf: string | null;
            guardianName: string | null;
            guardianPhoneNumber: string | null;
            id: string;
            isActive: boolean;
            isArchived: boolean;
            organizationId: string;
            phoneNumber: string;
            responsiblePhysicianId: string;
            updatedAt: string;
            updatedById: string;
            userId: string | null;
            weightInKg: number;
        };
        RegisteredUserDto: {
            email: string;
            fullName: string;
            phoneNumber: string;
            profession: "PHYSICIAN" | "NURSE" | "NURSING_TECHNICIAN" | "RECEPTIONIST";
            professionalId: string;
            userId: string;
        };
        ResendAdministratorInviteResponseDto: {
            administratorInvite: components["schemas"]["ProvisionedAdministratorInviteDto"];
            inviteEmailDelivered: boolean;
            reissued: boolean;
        };
        ResolvedPrescriptionInputDto: {
            protocolId: string;
            protocolVersionId: string;
            route: "SUBCUTANEOUS";
            startingStepId: string;
            stepIds: string[];
            targetStepId: string;
        };
        ResponsiblePhysicianDto: {
            councilNumber: string | null;
            councilUf: string | null;
            fullName: string;
            id: string;
        };
        RetractDoseDto: {
            expectedRevision: number;
            expectedTherapyRevision: number;
            idempotencyKey?: string;
            reason: string;
        };
        RetractDoseResponseDto: {
            archivedSuccessorId: string | null;
            dose: components["schemas"]["DoseRecordDto"];
            reissuedDose: components["schemas"]["DoseRecordDto"];
            therapyRevision: number;
        };
        RevisionPendingStepDto: {
            concentration: string;
            id: string;
            intervalDays: number;
            label: string;
            volume: string;
        };
        RoleResponseDto: {
            grantedAt: string;
            grantedById: string;
            id: string;
            professionalId: string;
            revokedAt?: string | null;
            revokedById?: string | null;
            role: "ADMINISTRATOR" | "RECEPTIONIST" | "PHYSICIAN" | "NURSE";
        };
        ScheduleDoseItemDto: {
            administeredAt: string | null;
            administeredStepId: string | null;
            administeredValues: components["schemas"]["DoseValuesResponseDto"] | null;
            administrationEndedAt: string | null;
            id: string;
            immunotherapy: components["schemas"]["ScheduleTherapySummaryDto"];
            immunotherapyId: string;
            plannedStepId: string | null;
            plannedValues: components["schemas"]["DoseValuesResponseDto"] | null;
            revision: number;
            scheduledAt: string;
            status: "SCHEDULED" | "ADMINISTERED_ON_SCHEDULE" | "ADMINISTERED_OFF_SCHEDULE" | "ENTERED_IN_ERROR";
            timeZone?: string | null;
        };
        SchedulePatientSummaryDto: {
            fullName: string;
            id: string;
            isActive: boolean;
            phoneNumber: string;
            responsiblePhysician: components["schemas"]["SchedulePhysicianSummaryDto"];
        };
        SchedulePhysicianSummaryDto: {
            fullName: string;
            id: string;
        };
        ScheduleTherapySummaryDto: {
            extract: string;
            id: string;
            immunoType: string;
            patient: components["schemas"]["SchedulePatientSummaryDto"];
            revision: number;
            status: "IN_PROGRESS" | "SUSPENDED" | "COMPLETED";
        };
        SelfRequestEmailChangeDto: {
            newEmail: string;
        };
        SessionEnvelopeDto: {
            authenticated: true;
            csrfToken: string;
            session: components["schemas"]["SessionStateDto"];
        };
        SessionStateDto: {
            createdAt: string;
            expiresAt: string;
            id: string;
            lastInteractiveAt: string;
            mfaVerified: boolean;
            organizationId: string;
            reauthenticatedAt: string | null;
            userId: string;
        };
        SetPreferenceDto: {
            enabled: boolean;
            kind: "PHYSICIAN_REVIEW_REQUESTED" | "TREATMENT_SUSPENDED" | "EMAIL_CHANGE_REQUEST_PENDING" | "EMAIL_CHANGE_REQUEST_DECIDED";
        };
        SimulateProtocolDto: {
            administered: components["schemas"]["AdministeredValuesInputDto"];
            prescription: components["schemas"]["ResolvedPrescriptionInputDto"];
            stepId?: string;
        };
        SimulationEndOfSequenceDto: {
            fromStepId: string;
            kind: "END_OF_SEQUENCE";
            protocolVersionId: string;
        };
        SimulationRecommendedDto: {
            fromStepId: string;
            kind: "RECOMMENDED";
            label: string;
            phase: "BUILD_UP" | "MAINTENANCE";
            protocolVersionId: string;
            stepId: string;
            values: components["schemas"]["SimulationValuesDto"];
        };
        SimulationUnresolvedDto: {
            code: "INVALID_PROTOCOL" | "INVALID_PRESCRIPTION" | "INVALID_ADMINISTERED_VALUES" | "CONTEXT_MISMATCH" | "STEP_NOT_IN_PRESCRIPTION" | "STEP_VALUE_MISMATCH" | "VALUE_NOT_CONFIGURED" | "AMBIGUOUS_VALUE";
            kind: "UNRESOLVED";
        };
        SimulationValuesDto: {
            concentration: string;
            concentrationUnit: "DILUTION_DENOMINATOR";
            intervalDays: number;
            phase?: "BUILD_UP" | "MAINTENANCE";
            route: "SUBCUTANEOUS";
            volume: string;
            volumeUnit: "mL";
        };
        StartSessionDto: {
            email: string;
            password: string;
        };
        StatusHistoryBucketDto: {
            active: number;
            completed: number;
            date: string;
            label: string;
            suspended: number;
            unknown: number;
        };
        StatusHistoryResponseDto: {
            asOf: string;
            buckets: components["schemas"]["StatusHistoryBucketDto"][];
            complete: boolean;
            timeZone: string;
            totalTherapies: number;
        };
        SupportRequestDto: {
            message: string;
            subject: string;
        };
        SupportRequestListItemDto: {
            createdAt: string;
            id: string;
            message: string;
            status: "RECEIVED" | "HANDLED";
            subject: string;
        };
        SupportRequestReceiptDto: {
            createdAt: string;
            id: string;
            received: boolean;
            status: "RECEIVED" | "HANDLED";
        };
        TeamMemberDto: {
            councilNumber: string | null;
            councilUf: string | null;
            createdAt: string;
            email: string;
            fullName: string;
            isActive: boolean;
            phoneNumber: string;
            profession: "PHYSICIAN" | "NURSE" | "NURSING_TECHNICIAN" | "RECEPTIONIST";
            professionalId: string;
            roles: ("ADMINISTRATOR" | "RECEPTIONIST" | "PHYSICIAN" | "NURSE")[];
            userId: string;
        };
        TeamMemberPageDto: {
            items: components["schemas"]["TeamMemberDto"][];
            page: number;
            pageSize: number;
            total: number;
        };
        TherapyLifecycleDto: {
            action: "SUSPEND" | "RESUME" | "COMPLETE";
            category?: string;
            expectedReturnAt?: string;
            expectedRevision: number;
            idempotencyKey?: string;
            reason: string;
            recommendations?: components["schemas"]["LifecycleRecommendationsDto"];
        };
        TherapyLifecycleEventDto: {
            archivedDoseIds: string[];
            category: string | null;
            createdAt: string;
            createdById: string;
            expectedReturnAt: string | null;
            id: string;
            immunotherapyId: string;
            reason: string;
            recommendations: components["schemas"]["LifecycleRecommendationsDto"] | null;
            type: "SUSPENSION" | "RESUMPTION" | "COMPLETION";
        };
        TherapyLifecycleEventWithAuthorDto: {
            archivedDoseIds: string[];
            category: string | null;
            createdAt: string;
            createdBy: components["schemas"]["LifecycleAuthorDto"];
            createdById: string;
            expectedReturnAt: string | null;
            id: string;
            immunotherapyId: string;
            reason: string;
            recommendations: components["schemas"]["LifecycleRecommendationsDto"] | null;
            type: "SUSPENSION" | "RESUMPTION" | "COMPLETION";
        };
        TherapyLifecycleHistoryDto: {
            events: components["schemas"]["TherapyLifecycleEventWithAuthorDto"][];
            therapy: components["schemas"]["TherapyLifecycleStateDto"];
        };
        TherapyLifecycleResultDto: {
            archivedDoseIds: string[];
            event: components["schemas"]["TherapyLifecycleEventDto"];
            revision: number;
            status: "IN_PROGRESS" | "SUSPENDED" | "COMPLETED";
        };
        TherapyLifecycleStateDto: {
            id: string;
            revision: number;
            status: "IN_PROGRESS" | "SUSPENDED" | "COMPLETED";
        };
        TherapyNextDoseDto: {
            id: string;
            intervalDays: number;
            phase: "BUILD_UP" | "MAINTENANCE";
            scheduledAt: string;
            status: "SCHEDULED" | "ADMINISTERED_ON_SCHEDULE" | "ADMINISTERED_OFF_SCHEDULE" | "ENTERED_IN_ERROR";
        };
        TherapyPatientRefDto: {
            fullName: string;
            id: string;
            isActive: boolean;
        };
        TherapyPhysicianRefDto: {
            fullName: string;
            id: string;
        };
        TherapyPrescriptionDetailDto: {
            resolved?: Record<string, never>;
            revision: number;
            versionId: string;
        };
        TherapyPrescriptionRefDto: {
            revision: number;
            versionId: string;
        };
        TherapySummaryDto: {
            administrationRoute: "SUBCUTANEOUS" | "SUBLINGUAL";
            createdAt: string;
            extract: string;
            id: string;
            immunoType: string;
            inductionStartDate: string;
            maintenanceStartDate: string | null;
            nextDose?: components["schemas"]["TherapySummaryNextDoseDto"] | null;
            prescription?: components["schemas"]["TherapyPrescriptionRefDto"] | null;
            revision: number;
            status: "IN_PROGRESS" | "SUSPENDED" | "COMPLETED";
        };
        TherapySummaryNextDoseDto: {
            id: string;
            scheduledAt: string;
            status: "SCHEDULED" | "ADMINISTERED_ON_SCHEDULE" | "ADMINISTERED_OFF_SCHEDULE" | "ENTERED_IN_ERROR";
        };
        TreatmentProtocolDto: {
            available: boolean;
            createdAt: string;
            createdById: string;
            id: string;
            name: string;
            organizationId: string;
            route: "SUBCUTANEOUS" | "SUBLINGUAL";
            versions: components["schemas"]["ProtocolVersionDto"][];
        };
        TreatmentProtocolSummaryDto: {
            available: boolean;
            createdAt: string;
            createdById: string;
            id: string;
            name: string;
            organizationId: string;
            route: "SUBCUTANEOUS" | "SUBLINGUAL";
        };
        UpdateAppointmentDto: {
            endsAt?: string;
            expectedRevision: number;
            notes?: string;
            professionalId?: string;
            startsAt?: string;
            status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "MISSED";
            statusReason?: string;
            title?: string;
        };
        UpdateImmunotherapyDto: {
            expectedRevision: number;
            immunoType: string;
        };
        UpdateMemberAccessDto: {
            isActive: boolean;
        };
        UpdateOrganizationDto: {
            expectedRevision?: number;
            name?: string;
            timeZone?: "America/Sao_Paulo" | "America/Manaus" | "America/Belem" | "America/Fortaleza" | "America/Recife" | "America/Bahia" | "America/Cuiaba" | "America/Campo_Grande" | "America/Porto_Velho" | "America/Boa_Vista" | "America/Rio_Branco" | "America/Noronha";
        };
        UpdateOwnProfileDto: {
            councilNumber?: string;
            councilUf?: string;
            fullName?: string;
            phoneNumber?: string;
        };
        UpdatePatientDto: {
            birthDate?: string;
            cpf?: string;
            fullName?: string;
            guardian?: components["schemas"]["GuardianDto"] | null;
            phoneNumber?: string;
            responsiblePhysicianId?: string;
            weightInKg?: number;
        };
        UpdatePatientStatusDto: {
            status: boolean;
        };
        UpdateScheduledDoseDto: {
            expectedRevision: number;
            expectedTherapyRevision: number;
            idempotencyKey?: string;
            reason: string;
            scheduledAt: string;
            values: components["schemas"]["ConfiguredDoseValuesDto"];
        };
        UpdateScheduledDoseResponseDto: {
            administeredAt: string | null;
            administeredById: string | null;
            administeredStepId: string | null;
            administeredValues: components["schemas"]["DoseValuesResponseDto"] | null;
            administrationEndedAt: string | null;
            archivedAt: string | null;
            archivedById: string | null;
            betweenDosesReport: string;
            concentration: number;
            createdAt: string;
            createdById: string;
            id: string;
            immediateConduct: "MAINTAIN" | "REQUEST_PHYSICIAN_REVIEW" | "SUSPEND_TREATMENT" | null;
            immediateConductJustification: string | null;
            immunotherapyId: string;
            isArchived: boolean;
            nextIntervalInDays: number;
            plannedStepId: string | null;
            plannedValues: components["schemas"]["DoseValuesResponseDto"] | null;
            prescriptionId: string | null;
            recommendation: (components["schemas"]["DoseRecommendationRecommendedDto"] | components["schemas"]["DoseRecommendationEndOfSequenceDto"]) | null;
            revision: number;
            scheduledAt: string;
            sourceDoseId: string | null;
            status: "SCHEDULED" | "ADMINISTERED_ON_SCHEDULE" | "ADMINISTERED_OFF_SCHEDULE" | "ENTERED_IN_ERROR";
            therapyRevision: number;
            timeZone?: string | null;
            updatedAt: string;
            updatedById: string;
            volume: string;
        };
        UpdateTeamMemberDto: {
            councilNumber?: string;
            councilUf?: string;
            fullName?: string;
            phoneNumber?: string;
            profession?: "PHYSICIAN" | "NURSE" | "NURSING_TECHNICIAN" | "RECEPTIONIST";
        };
        UpdateUserStatusDto: Record<string, never>;
        UserResponseDto: {
            createdAt: string;
            email: string;
            id: string;
            isActive: boolean;
            isArchived: boolean;
            type: "PROFESSIONAL" | "PATIENT";
            updatedAt: string;
        };
        VerifyMfaDto: {
            challengeToken: string;
            code: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    AccountController_getAccountContext: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountContextDto"];
                };
            };
        };
    };
    AccountController_requestOwnEmailChange: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SelfRequestEmailChangeDto"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmailChangeRequestDto"];
                };
            };
        };
    };
    AccountController_changePassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChangePasswordDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChangePasswordResponseDto"];
                };
            };
        };
    };
    AccountController_updateUserStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateUserStatusDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
        };
    };
    ProvisioningController_provision: {
        parameters: {
            query?: never;
            header: {
                "x-provisioning-key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProvisionOrganizationDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProvisionedOrganizationDto"];
                };
            };
        };
    };
    ProvisioningController_resendInvite: {
        parameters: {
            query?: never;
            header: {
                "x-provisioning-key": string;
            };
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResendAdministratorInviteResponseDto"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AppointmentsController_list: {
        parameters: {
            query: {
                page?: number;
                pageSize?: number;
                from: string;
                to: string;
                status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "MISSED";
                patientId?: string;
                professionalId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AppointmentPageDto"];
                };
            };
        };
    };
    AppointmentsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAppointmentDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AppointmentResponseDto"];
                };
            };
        };
    };
    AppointmentsController_read: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AppointmentResponseDto"];
                };
            };
        };
    };
    AppointmentsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAppointmentDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AppointmentResponseDto"];
                };
            };
        };
    };
    AuditController_list: {
        parameters: {
            query?: {
                entityType?: string;
                entityId?: string;
                userId?: string;
                action?: string;
                from?: string;
                to?: string;
                limit?: number;
                cursor?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuditLogDto"][];
                };
            };
        };
    };
    AuditController_listByActor: {
        parameters: {
            query?: {
                entityType?: string;
                entityId?: string;
                userId?: string;
                action?: string;
                from?: string;
                to?: string;
                limit?: number;
                cursor?: string;
            };
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuditLogDto"][];
                };
            };
        };
    };
    AuditController_listByEntity: {
        parameters: {
            query?: {
                entityType?: string;
                entityId?: string;
                userId?: string;
                action?: string;
                from?: string;
                to?: string;
                limit?: number;
                cursor?: string;
            };
            header?: never;
            path: {
                entityType: string;
                entityId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuditLogDto"][];
                };
            };
        };
    };
    SessionController_issueCsrfToken: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CsrfTokenResponseDto"];
                };
            };
        };
    };
    AuthController_emailChangeConfirm: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EmailChangeConfirmDTO"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmailChangeMessageResponseDto"];
                };
            };
        };
    };
    AuthController_emailChangeVerify: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EmailChangeVerifyDTO"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmailChangeVerifyResponseDto"];
                };
            };
        };
    };
    SessionController_logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SessionController_logoutAll: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SessionController_enrollFactor: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EnrollMfaDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MfaEnrollmentStartDto"];
                };
            };
        };
    };
    SessionController_confirmFactor: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfirmMfaEnrollmentDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecoveryCodesDto"];
                };
            };
        };
    };
    SessionController_listFactors: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MfaFactorsResponseDto"];
                };
            };
        };
    };
    SessionController_revokeFactor: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SessionController_regenerateRecoveryCodes: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecoveryCodesDto"];
                };
            };
        };
    };
    SessionController_verifySecondFactor: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyMfaDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MfaVerifiedSessionDto"];
                };
            };
        };
    };
    AuthController_passwordResetConfirm: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordResetConfirmDTO"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PasswordResetMessageResponseDto"];
                };
            };
        };
    };
    AuthController_passwordResetRequest: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordResetRequestDTO"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PasswordResetMessageResponseDto"];
                };
            };
        };
    };
    AuthController_passwordResetVerify: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordResetVerifyDTO"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PasswordResetVerifyResponseDto"];
                };
            };
        };
    };
    SessionController_confirmIdentity: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReauthenticateDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReauthenticationResponseDto"];
                };
            };
        };
    };
    SessionController_readSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionEnvelopeDto"];
                };
            };
        };
    };
    SessionController_registerActivity: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SessionController_listDevices: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeviceSessionDto"][];
                };
            };
        };
    };
    SessionController_createSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StartSessionDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionEnvelopeDto"] | components["schemas"]["MfaChallengeDto"] | components["schemas"]["MfaEnrollmentChallengeDto"];
                };
            };
        };
    };
    SessionController_revokeDevice: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PublicRequestsController_contact: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ContactRequestDto"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ContactRequestReceiptDto"];
                };
            };
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PublicRequestsController_demo: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DemoRequestDto"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DemoRequestReceiptDto"];
                };
            };
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DosesController_list: {
        parameters: {
            query: {
                page?: number;
                pageSize?: number;
                from: string;
                to: string;
                status?: "SCHEDULED" | "ADMINISTERED_ON_SCHEDULE" | "ADMINISTERED_OFF_SCHEDULE" | "ENTERED_IN_ERROR";
                search?: string;
                responsiblePhysicianId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageDto"] & {
                        items: components["schemas"]["ScheduleDoseItemDto"][];
                    };
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DosesController_read: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DoseDetailResponseDto"];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DosesController_legacy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DosesController_administer: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdministerDoseDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdministerDoseResponseDto"];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DosesController_addObservation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LateObservationDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LateObservationResponseDto"];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DosesController_preview: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DosePreviewDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DosePreviewResponseDto"];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DosesController_retract: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RetractDoseDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RetractDoseResponseDto"];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DosesController_edit: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateScheduledDoseDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UpdateScheduledDoseResponseDto"];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DosesController_metrics: {
        parameters: {
            query: {
                from: string;
                to: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DoseMetricsResponseDto"];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DosesController_legacyStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ImmunotherapiesController_findOneImmunotherapy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImmunotherapyDetailDto"];
                };
            };
        };
    };
    ImmunotherapiesController_updateImmunotherapy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateImmunotherapyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImmunotherapyResponseDto"];
                };
            };
        };
    };
    ImmunotherapiesController_findAllDosesForImmunotherapy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DoseResponseDto"][];
                };
            };
        };
    };
    ImmunotherapiesController_clinicalHistory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClinicalHistoryResponseDto"];
                };
            };
        };
    };
    ImmunotherapiesController_lifecycleHistory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TherapyLifecycleHistoryDto"];
                };
            };
        };
    };
    ImmunotherapiesController_lifecycleCommand: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TherapyLifecycleDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TherapyLifecycleResultDto"];
                };
            };
        };
    };
    ImmunotherapiesController_revisePrescription: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PrescriptionRevisionDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PrescriptionRevisionPreviewDto"] | components["schemas"]["PrescriptionRevisionAppliedDto"];
                };
            };
        };
    };
    ImmunotherapiesController_legacyStatus: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ImmunotherapiesController_exportClinical: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                asOf?: string;
                status?: "IN_PROGRESS" | "SUSPENDED" | "COMPLETED";
                responsiblePhysicianId?: string;
                justification?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClinicalExportPageDto"];
                };
            };
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ImmunotherapiesController_findAll: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                search?: string;
                status?: "IN_PROGRESS" | "SUSPENDED" | "COMPLETED";
                route?: "SUBCUTANEOUS" | "SUBLINGUAL";
                immunoType?: string;
                responsiblePhysicianId?: string;
                includeArchived?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PageDto"] & {
                        items: components["schemas"]["ImmunotherapyListItemDto"][];
                    };
                };
            };
        };
    };
    ImmunotherapiesController_findAllForPatient: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                patientId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImmunotherapyListItemDto"][];
                };
            };
        };
    };
    ImmunotherapiesController_readPatientRecord: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                patientId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatientClinicalRecordDto"];
                };
            };
        };
    };
    ImmunotherapiesController_createImmunotherapy: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateImmunotherapyDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImmunotherapyRegistrationResponseDto"];
                };
            };
        };
    };
    ImmunotherapiesController_readStatusHistory: {
        parameters: {
            query: {
                from: string;
                to: string;
                timeZone: string;
                granularity: "week" | "month";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StatusHistoryResponseDto"];
                };
            };
        };
    };
    ImmunotherapiesController_findAllForType: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                type: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImmunotherapyResponseDto"][];
                };
            };
        };
    };
    ImmunotherapiesController_listTypes: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
        };
    };
    NotificationsController_list: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                unreadOnly?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationPageDto"];
                };
            };
        };
    };
    NotificationsController_markRead: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationDto"];
                };
            };
        };
    };
    NotificationsController_outboxStatus: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OutboxStatusDto"];
                };
            };
        };
    };
    NotificationsController_retryOutbox: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OutboxRetryResponseDto"];
                };
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationsController_preferences: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationPreferenceDto"][];
                };
            };
        };
    };
    NotificationsController_setPreference: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SetPreferenceDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationPreferenceDto"][];
                };
            };
        };
    };
    NotificationsController_markAllRead: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MarkAllReadResponseDto"];
                };
            };
        };
    };
    InviteController_createInvite: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateInviteDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InviteResponseDto"];
                };
            };
        };
    };
    InviteController_cancelInvite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    InviteController_resendInvite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InviteResponseDto"];
                };
            };
        };
    };
    InviteController_readContext: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InviteContextDto"];
                };
            };
        };
    };
    InviteController_listInvites: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                role?: "ADMINISTRATOR" | "RECEPTIONIST" | "PHYSICIAN" | "NURSE";
                onlyActive?: boolean;
                includeExpired?: boolean;
                search?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InvitePageDto"];
                };
            };
        };
    };
    RegistrationController_completeRegistration: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                inviteToken: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProfileInternalUserDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegisteredUserDto"];
                };
            };
        };
    };
    OrganizationController_findMyOrganization: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrganizationResponseDto"];
                };
            };
        };
    };
    OrganizationController_updateMyOrganization: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateOrganizationDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrganizationResponseDto"];
                };
            };
        };
    };
    PatientsController_findAll: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                search?: string;
                isActive?: boolean;
                responsiblePhysicianId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatientListPageDto"];
                };
            };
        };
    };
    PatientsController_findOne: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatientDetailDto"];
                };
            };
        };
    };
    PatientsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdatePatientDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatientResponseDto"];
                };
            };
        };
    };
    PatientsController_updateStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdatePatientStatusDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatientResponseDto"];
                };
            };
        };
    };
    ProfessionalsController_list: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                search?: string;
                role?: "ADMINISTRATOR" | "RECEPTIONIST" | "PHYSICIAN" | "NURSE";
                profession?: "PHYSICIAN" | "NURSE" | "NURSING_TECHNICIAN" | "RECEPTIONIST";
                isActive?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TeamMemberPageDto"];
                };
            };
        };
    };
    ProfessionalsController_updateMember: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTeamMemberDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalResponseDto"];
                };
            };
        };
    };
    ProfessionalsController_changeAccess: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateMemberAccessDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemberAccessStatusDto"];
                };
            };
        };
    };
    ProfessionalsController_startEmailChange: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminRequestEmailChangeDto"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmailChangeRequestDto"];
                };
            };
        };
    };
    ProfessionalsController_listPendingEmailChanges: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmailChangeRequestPageDto"];
                };
            };
        };
    };
    ProfessionalsController_approvePendingEmailChange: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApproveEmailChangeDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmailChangeRequestDto"];
                };
            };
        };
    };
    ProfessionalsController_rejectPendingEmailChange: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmailChangeRequestDto"];
                };
            };
        };
    };
    ProfessionalsController_readOwnProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalResponseDto"];
                };
            };
        };
    };
    ProfessionalsController_updateOwnProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateOwnProfileDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfessionalResponseDto"];
                };
            };
        };
    };
    RolesController_grant: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateProfessionalRoleDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RoleResponseDto"];
                };
            };
        };
    };
    RolesController_findOne: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RoleResponseDto"];
                };
            };
        };
    };
    RolesController_revoke: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RoleResponseDto"];
                };
            };
        };
    };
    RolesController_listByProfessional: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                professionalId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RoleResponseDto"][];
                };
            };
        };
    };
    PublicRequestsController_listSupport: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SupportRequestListItemDto"][];
                };
            };
        };
    };
    PublicRequestsController_support: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SupportRequestDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SupportRequestReceiptDto"];
                };
            };
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProtocolCatalogController_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TreatmentProtocolDto"][];
                };
            };
        };
    };
    ProtocolCatalogController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateProtocolDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateProtocolResultDto"];
                };
            };
        };
    };
    ProtocolCatalogController_version: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateProtocolVersionDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProtocolVersionDto"];
                };
            };
        };
    };
    ProtocolCatalogController_readSettings: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutomationSettingsViewDto"];
                };
            };
        };
    };
    ProtocolCatalogController_settings: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AutomationSettingsDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutomationSettingsResultDto"];
                };
            };
        };
    };
    ProtocolCatalogController_inventory: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MigrationInventoryDto"];
                };
            };
        };
    };
    ProtocolCatalogController_origin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TreatmentProtocolDto"];
                };
            };
        };
    };
    ProtocolCatalogController_bind: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BindLegacyProtocolDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BindLegacyDryRunResultDto"] | components["schemas"]["BindLegacyResultDto"];
                };
            };
        };
    };
    ProtocolCatalogController_read: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProtocolVersionDto"];
                };
            };
        };
    };
    ProtocolCatalogController_discard: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProtocolRevisionDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DiscardDraftResultDto"];
                };
            };
        };
    };
    ProtocolCatalogController_edit: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EditProtocolVersionDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProtocolVersionDto"];
                };
            };
        };
    };
    ProtocolCatalogController_defaults: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProtocolRevisionDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProtocolVersionDto"];
                };
            };
        };
    };
    ProtocolCatalogController_publish: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProtocolRevisionDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProtocolVersionDto"];
                };
            };
        };
    };
    ProtocolCatalogController_retire: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProtocolRevisionDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProtocolVersionDto"];
                };
            };
        };
    };
    ProtocolCatalogController_simulate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SimulateProtocolDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimulationRecommendedDto"] | components["schemas"]["SimulationEndOfSequenceDto"] | components["schemas"]["SimulationUnresolvedDto"];
                };
            };
        };
    };
}
