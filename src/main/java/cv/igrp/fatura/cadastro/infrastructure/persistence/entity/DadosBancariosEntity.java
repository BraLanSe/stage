package cv.igrp.fatura.cadastro.infrastructure.persistence.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name = "dados_bancarios")
public class DadosBancariosEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String banco;
    private String nib;
    private String iban;
    private String swift;
    private String titular;
}