package cv.igrp.fatura.cadastro.infrastructure.persistence.repository;

import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.ProdutoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<ProdutoEntity, Integer> {
    Optional<ProdutoEntity> findByCodigo(String codigo);
}
