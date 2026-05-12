package cv.igrp.fatura.cadastro.infrastructure.persistence.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import cv.igrp.fatura.shared.config.AuditEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "dados_bancarios")
public class DadosBancariosEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "banco", length = 100)
    private String banco;

    @Column(name = "nib", length = 50)
    private String nib;

    @Column(name = "iban", length = 34)
    private String iban;

    @Column(name = "swift", length = 11)
    private String swift;

    @Column(name = "titular", length = 150)
    private String titular;

    @Column(name = "estado", nullable = true, length = 20)
    private String estado = "ATIVO";
}
