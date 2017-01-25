(function () {
  "use strict";

  angular.module('mnSecurity', [
    'mnExternalRoles',
    'mnPluggableUiRegistry',
    'mnRootCertificate'
  ]).config(mnIndexesConfig);

  function mnIndexesConfig($stateProvider) {
    $stateProvider
      .state('app.admin.security', {
        abstract: true,
        controller: "mnSecurityController as securityCtl",
        templateUrl: "app/mn_admin/mn_security/mn_security.html",
        permissions: "cluster.admin.security.read"
      })
      .state('app.admin.security.externalRoles', {
        url: "/externalRoles",
        controller: "mnExternalRolesController as externalRolesCtl",
        templateUrl: "app/mn_admin/mn_security/mn_external_roles/mn_external_roles.html",
        data: {
          compat: "atLeast45",
          ldap: true,
          enterprise: true
        }
      })
      .state('app.admin.security.internalRoles', {
        url: '/internalRoles',
        controller: 'mnInternalRolesController as internalRolesCtl',
        templateUrl: 'app/mn_admin/mn_security/mn_internal_roles/mn_internal_roles.html',
        data: {
          permissions: "cluster.admin.security.write"
        }
      })
      .state('app.admin.security.rootCertificate', {
        url: '/rootCertificate',
        controller: 'mnRootCertificateController as rootCertificateCtl',
        templateUrl: 'app/mn_admin/mn_security/mn_root_certificate/mn_root_certificate.html',
        data: {
          enterprise: true
        }
      })
      .state('app.admin.security.ldap', {
        url: '/ldap',
        controller: 'mnLdapController as ldapCtl',
        templateUrl: 'app/mn_admin/mn_security/mn_ldap/mn_ldap.html',
        data: {
          ldap: true,
          compat: "atLeast40 && !atLeast45",
          enterprise: true
        }
      })
      .state('app.admin.security.audit', {
        url: '/audit',
        controller: 'mnAuditController as auditCtl',
        templateUrl: 'app/mn_admin/mn_security/mn_audit/mn_audit.html',
        data: {
          enterprise: true,
          compat: "atLeast40"
        }
      });
  }
})();