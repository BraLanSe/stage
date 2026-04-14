package cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository;

import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrSerieEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrSerieRepository extends JpaRepository<PrSerieEntity, Integer> {
    Optional<PrSerieEntity> findByCodigo(String codigo);
}
