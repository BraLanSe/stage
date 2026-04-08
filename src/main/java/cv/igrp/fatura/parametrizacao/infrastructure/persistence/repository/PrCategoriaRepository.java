package cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository;

import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrCategoriaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrCategoriaRepository extends JpaRepository<PrCategoriaEntity, Integer> {
    Optional<PrCategoriaEntity> findByCodigo(String codigo);
}
