package cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository;

import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrEnquadramentoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrEnquadramentoRepository extends JpaRepository<PrEnquadramentoEntity, Integer> {
    Optional<PrEnquadramentoEntity> findByCodigo(String codigo);
}
