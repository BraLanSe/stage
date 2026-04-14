package cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository;

import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrMoedaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrMoedaRepository extends JpaRepository<PrMoedaEntity, Integer> {
    Optional<PrMoedaEntity> findByCodigo(String codigo);
}
