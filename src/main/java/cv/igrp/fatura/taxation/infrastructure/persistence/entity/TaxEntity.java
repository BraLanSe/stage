/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME */

package cv.igrp.fatura.taxation.infrastructure.persistence.entity;

import cv.igrp.fatura.shared.config.AuditEntity;
import cv.igrp.framework.stereotype.IgrpEntity;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;


@Getter
@Setter
@IgrpEntity
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "t_tax")
public class TaxEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", unique = true, nullable = false)
    private Integer id;

  
    @NotBlank(message = "taxTypeCode is mandatory")
    @Column(name="taxtypecode", nullable = false)
    private String taxTypeCode;

  
    @Column(name="taxpercentage")
    private BigDecimal taxPercentage;

  
    @Column(name="taxamount")
    private BigDecimal taxAmount;

  


  @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dfe_id", referencedColumnName = "id")
    private TaxEntity dfeId;   @OneToMany(mappedBy = "dfeId")
private List<TaxEntity>  = new ArrayList<>();

   @OneToMany(mappedBy = "dfeId")
private List<TaxEntity>  = new ArrayList<>();


}