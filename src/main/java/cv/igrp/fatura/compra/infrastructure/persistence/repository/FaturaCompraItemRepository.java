package cv.igrp.fatura.compra.infrastructure.persistence.repository;

import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FaturaCompraItemRepository extends JpaRepository<FaturaCompraItemEntity, Integer> {
}
