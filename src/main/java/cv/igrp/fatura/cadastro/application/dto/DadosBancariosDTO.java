package cv.igrp.fatura.cadastro.application.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class DadosBancariosDTO {
    private Integer id;
    private String banco;
    private String nib;
    private String iban;
    private String swift;
    private String titular;
}