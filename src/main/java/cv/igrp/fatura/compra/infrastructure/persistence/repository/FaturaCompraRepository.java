package cv.igrp.fatura.compra.infrastructure.persistence.repository;

import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaturaCompraRepository extends JpaRepository<FaturaCompraEntity, Integer> {
    List<FaturaCompraEntity> findByFornecedor_Id(Integer fornecedorId);
    List<FaturaCompraEntity> findByEstado(String estado);
}
