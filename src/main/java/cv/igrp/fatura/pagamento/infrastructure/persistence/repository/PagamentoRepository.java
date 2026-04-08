package cv.igrp.fatura.pagamento.infrastructure.persistence.repository;

import cv.igrp.fatura.pagamento.infrastructure.persistence.entity.PagamentoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PagamentoRepository extends JpaRepository<PagamentoEntity, Integer> {
}
