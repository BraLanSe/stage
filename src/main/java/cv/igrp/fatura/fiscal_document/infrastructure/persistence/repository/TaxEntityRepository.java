package cv.igrp.fatura.fiscal_document.infrastructure.persistence.repository;

import cv.igrp.fatura.fiscal_document.infrastructure.persistence.entity.TaxEntity;
import cv.igrp.fatura.shared.domain.exceptions.IgrpResponseStatusException;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.http.HttpStatus;
import java.util.Optional;



@Repository
public interface TaxEntityRepository extends
    JpaRepository<TaxEntity, Integer>,
    JpaSpecificationExecutor<TaxEntity>
{

      default TaxEntity findByIdOrThrow(Integer id) {
          return this.findById(id)
          .orElseThrow(() -> IgrpResponseStatusException.of(HttpStatus.NOT_FOUND,"TaxEntity not found for id: " + id));
      }

}