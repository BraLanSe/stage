package cv.igrp.fatura.contabilidade.infrastructure.persistence.repository;

import cv.igrp.fatura.contabilidade.infrastructure.persistence.entity.GlContaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GlContaRepository extends JpaRepository<GlContaEntity, Integer> {
    Optional<GlContaEntity> findByCodigo(String codigo);
}
