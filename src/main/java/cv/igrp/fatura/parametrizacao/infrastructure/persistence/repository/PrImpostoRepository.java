package cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository;

import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrImpostoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrImpostoRepository extends JpaRepository<PrImpostoEntity, Integer> {
    Optional<PrImpostoEntity> findByCodigo(String codigo);
}
