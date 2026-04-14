package cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository;

import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrMetodoPagamentoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrMetodoPagamentoRepository extends JpaRepository<PrMetodoPagamentoEntity, Integer> {
    Optional<PrMetodoPagamentoEntity> findByCodigo(String codigo);
}
