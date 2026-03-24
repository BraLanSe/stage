/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME */

package cv.igrp.fatura.fiscal_document.infrastructure.persistence.entity;

import cv.igrp.fatura.shared.config.AuditEntity;
import cv.igrp.framework.stereotype.IgrpEntity;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.ArrayList;


@Getter
@Setter
@IgrpEntity
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "t_party")
public class PartyEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", unique = true, nullable = false)
    private Integer id;

  
    @NotBlank(message = "taxId is mandatory")
    @Column(name="tax_id", nullable = false, length=9)
    private String taxId;

  
    @NotBlank(message = "countryCode is mandatory")
    @Column(name="country_code", nullable = false, length=2)
    private String countryCode;

  
    @NotBlank(message = "name is mandatory")
    @Column(name="name", nullable = false, length=150)
    private String name;

  
    @NotBlank(message = "addressCode is mandatory")
    @Column(name="address_code", nullable = false, length=20)
    private String addressCode;

  
    @NotBlank(message = "email is mandatory")
    @Column(name="email", nullable = false)
    private String email;

  
    @NotBlank(message = "phone is mandatory")
    @Column(name="phone", nullable = false)
    private String phone;

  


  @OneToMany(mappedBy = "", fetch = FetchType.LAZY)
private List<DfeEntity> dfes = new ArrayList<>();   @OneToMany(mappedBy = "emitterId")
private List<DfeEntity>  = new ArrayList<>();

   @OneToMany(mappedBy = "emitterId")
private List<DfeEntity>  = new ArrayList<>();

   @OneToMany(mappedBy = "emitterId")
private List<DfeEntity>  = new ArrayList<>();

   @OneToMany(mappedBy = "emitterId")
private List<DfeEntity>  = new ArrayList<>();


}