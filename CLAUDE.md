# eFatura Project Guide

## Commands
- **Backend Build:** `mvn clean compile`
- **Backend Run:** `mvn spring-boot:run`
- **Backend Test:** `.\seed-and-test.ps1`
- **Frontend Check:** `.\.claude\skills\frontend-check.ps1`
- **Health Check:** `.\.claude\skills\health-check.ps1`

## Architecture
- **Pattern:** CQRS (Command/Handler)
- **Entities:** All extend `AuditEntity`.
- **JSON Fix:** `@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})` on all entities to handle Hibernate Proxies.
- **Business Rule:** Invoice state machine (RASCUNHO -> CONFIRMADO). Confirmation is final.

## Development Standards
- Use functional React components with Tailwind CSS.
- Ensure API calls match the DTO structures in `cv.igrp.fatura.*.application.dto`.