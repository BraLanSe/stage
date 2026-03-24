/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME */

package cv.igrp.fatura.fiscal_document.infrastructure.persistence.entity;

import cv.igrp.fatura.shared.config.AuditEntity;
import cv.igrp.framework.stereotype.IgrpEntity;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import jakarta.validation.constraints.NotNull;


@Getter
@Setter
@IgrpEntity
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "t_line")
public class LineEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", unique = true, nullable = false)
    private Integer id;

  
    @NotBlank(message = "lineTypeCode is mandatory")
    @Column(name="line_type_code", nullable = false)
    private String lineTypeCode;

  
    @NotBlank(message = "description is mandatory")
    @Column(name="description", nullable = false, length=300)
    private String description;

  
    @NotNull(message = "quantity is mandatory")
    @Column(name="quantity", nullable = false)
    private BigDecimal quantity;

  
    @NotNull(message = "unitPrice is mandatory")
    @Column(name="unit_price", nullable = false)
    private BigDecimal unitPrice;

  
    @NotNull(message = "netTotal is mandatory")
    @Column(name="net_total", nullable = false)
    private BigDecimal netTotal;

  
}