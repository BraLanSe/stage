/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME */

package cv.igrp.fatura.fiscal_document.infrastructure.persistence.entity;

import cv.igrp.fatura.shared.config.AuditEntity;
import cv.igrp.framework.stereotype.IgrpEntity;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;


@Getter
@Setter
@IgrpEntity
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "t_dfe")
public class DfeEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", unique = true, nullable = false)
    private Integer id;

  
    @NotBlank(message = "iud is mandatory")
    @Column(name="iud", unique = true, nullable = false, length=45)
    private String iud;

  
    @NotNull(message = "documentTypeCode is mandatory")
    @Column(name="document_type_code", nullable = false)
    private Integer documentTypeCode;

  
    @NotNull(message = "ledCode is mandatory")
    @Column(name="led_code", nullable = false)
    private Integer ledCode;

  
    @NotNull(message = "documentNumber is mandatory")
    @Column(name="document_number", nullable = false)
    private Integer documentNumber;

  
    @NotNull(message = "issueDateTime is mandatory")
    @Column(name="issue_date_time", nullable = false)
    private LocalDateTime issueDateTime;

  
    @NotBlank(message = "status is mandatory")
    @Column(name="status", nullable = false)
    private String status;

  


  @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emitter_id", referencedColumnName = "id")
    private PartyEntity emitterId;


  @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dfe_id", referencedColumnName = "id")
    private DfeEntity dfeId;


  @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payments", referencedColumnName = "id")
    private PaymentEntity payments;


  @OneToMany(mappedBy = "", fetch = FetchType.LAZY)
private List<PaymentEntity> taxes = new ArrayList<>();   @OneToMany(mappedBy = "emitterId")
private List<DfeEntity>  = new ArrayList<>();

   @OneToMany(mappedBy = "taxes")
private List<DfeEntity>  = new ArrayList<>();

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "")
   private PartyEntity ;

   @OneToMany(mappedBy = "dfeId")
private List<DfeEntity> lines = new ArrayList<>();

   @OneToMany(mappedBy = "dfeId")
private List<Tax>  = new ArrayList<>();


}