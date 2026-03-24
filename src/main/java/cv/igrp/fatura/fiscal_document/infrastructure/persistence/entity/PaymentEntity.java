/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME */

package cv.igrp.fatura.fiscal_document.infrastructure.persistence.entity;

import cv.igrp.fatura.shared.config.AuditEntity;
import cv.igrp.framework.stereotype.IgrpEntity;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;


@Getter
@Setter
@IgrpEntity
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "t_payment")
public class PaymentEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", unique = true, nullable = false)
    private Integer id;

  
    @NotBlank(message = "paymentMeansCode is mandatory")
    @Column(name="paymentmeanscode", nullable = false)
    private String paymentMeansCode;

  
    @Column(name="paymentdate")
    private LocalDate paymentDate;

  
    @Column(name="paymentamount")
    private BigDecimal paymentAmount;

     @OneToMany(mappedBy = "payments")
private List<DfeEntity>  = new ArrayList<>();


}

}