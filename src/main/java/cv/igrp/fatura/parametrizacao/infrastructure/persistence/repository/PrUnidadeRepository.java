package cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository;

import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrUnidadeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrUnidadeRepository extends JpaRepository<PrUnidadeEntity, Integer> {
    Optional<PrUnidadeEntity> findByCodigo(String codigo);
}
