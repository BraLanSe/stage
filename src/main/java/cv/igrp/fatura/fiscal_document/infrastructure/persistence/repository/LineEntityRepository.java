package cv.igrp.fatura.fiscal_document.infrastructure.persistence.repository;

import cv.igrp.fatura.fiscal_document.infrastructure.persistence.entity.LineEntity;
import cv.igrp.fatura.shared.domain.exceptions.IgrpResponseStatusException;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.http.HttpStatus;
import java.util.Optional;



@Repository
public interface LineEntityRepository extends
    JpaRepository<LineEntity, Integer>,
    JpaSpecificationExecutor<LineEntity>
{

      default LineEntity findByIdOrThrow(Integer id) {
          return this.findById(id)
          .orElseThrow(() -> IgrpResponseStatusException.of(HttpStatus.NOT_FOUND,"LineEntity not found for id: " + id));
      }

}