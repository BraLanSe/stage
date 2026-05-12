package cv.igrp.fatura.compra.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
@Schema(description = "Dados para criação ou atualização de uma fatura de compra")
public class FaturaCompraCreateDTO {

    @Schema(description = "Código de referência externo (ex: número da fatura do fornecedor)", example = "FAT-FORN-2024-001")
    private String codigoReferencia;

    @NotNull
    @Schema(description = "ID do tipo de fatura (FT, FR, ND, NC...)", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer tipoFaturaId;

    @NotNull
    @Schema(description = "Data de emissão da fatura", example = "2024-01-15", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDate dtFaturacao;

    @Schema(description = "Data limite de validade da fatura", example = "2024-02-15")
    private LocalDate limitFaturacao;

    @Schema(description = "Data de vencimento do pagamento (deve ser >= dtFaturacao)", example = "2024-02-15")
    private LocalDate dtVencimentoFatura;

    @NotNull
    @Schema(description = "ID do fornecedor", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer fornecedorId;

    @NotNull
    @Schema(description = "ID da série de numeração", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer prSerieId;

    @Schema(description = "Meio de pagamento", example = "Transferencia")
    private String meioPagamento;

    @Schema(description = "Termos e condições de pagamento", example = "Pagamento a 60 dias")
    private String termCondicoes;

    @Schema(description = "Observações internas", example = "Recebido com danos parciais")
    private String nota;

    @Schema(description = "Banco do fornecedor para pagamento", example = "BCA")
    private String fornecedorBanco;

    @Schema(description = "IBAN do fornecedor para pagamento", example = "CV60 0002 0000 0000 1234 5")
    private String fornecedorIban;

    @Schema(description = "Banco da nossa empresa", example = "BCA")
    private String nossoBanco;

    @Schema(description = "IBAN da nossa empresa", example = "CV60 0002 0000 0000 9876 5")
    private String nossoIban;

    @NotNull
    @Size(min = 1)
    @Schema(description = "Linhas de artigos da fatura (mínimo 1)", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<FaturaCompraItemDTO> items = new ArrayList<>();
}
