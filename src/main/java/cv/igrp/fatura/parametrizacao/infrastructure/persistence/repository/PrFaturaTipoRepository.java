package cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository;

import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrFaturaTipoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrFaturaTipoRepository extends JpaRepository<PrFaturaTipoEntity, Integer> {
    Optional<PrFaturaTipoEntity> findByCodigo(String codigo);
}
