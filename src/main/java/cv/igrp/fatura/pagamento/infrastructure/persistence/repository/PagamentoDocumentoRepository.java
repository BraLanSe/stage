package cv.igrp.fatura.pagamento.infrastructure.persistence.repository;

import cv.igrp.fatura.pagamento.infrastructure.persistence.entity.PagamentoDocumentoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PagamentoDocumentoRepository extends JpaRepository<PagamentoDocumentoEntity, Integer> {
    List<PagamentoDocumentoEntity> findByPagamento_Id(Integer pagamentoId);
}
