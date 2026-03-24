package cv.igrp.fatura.fiscal_document.infrastructure.persistence.repository;

import cv.igrp.fatura.fiscal_document.infrastructure.persistence.entity.DfeEntity;
import cv.igrp.fatura.shared.domain.exceptions.IgrpResponseStatusException;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.http.HttpStatus;
import java.util.Optional;



@Repository
public interface DfeEntityRepository extends
    JpaRepository<DfeEntity, Integer>,
    JpaSpecificationExecutor<DfeEntity>
{

      default DfeEntity findByIdOrThrow(Integer id) {
          return this.findById(id)
          .orElseThrow(() -> IgrpResponseStatusException.of(HttpStatus.NOT_FOUND,"DfeEntity not found for id: " + id));
      }

}