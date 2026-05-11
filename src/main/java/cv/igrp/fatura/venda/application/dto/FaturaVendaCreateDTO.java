package cv.igrp.fatura.venda.application.dto;

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
@Schema(description = "Dados para criação ou atualização de uma fatura de venda")
public class FaturaVendaCreateDTO {

    @Schema(description = "Código de referência externo (ex: número do pedido do cliente)", example = "PO-2024-001")
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
    @Schema(description = "ID do cliente", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer clienteId;

    @NotNull
    @Schema(description = "ID da série de numeração", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer prSerieId;

    @Schema(description = "Termos e condições de pagamento", example = "Pagamento a 30 dias")
    private String termCondicoes;

    @Schema(description = "Observações internas", example = "Entrega urgente")
    private String nota;

    @Schema(description = "Meio de pagamento utilizado", example = "Cartão Vinte4")
    private String meioPagamento;

    @NotNull
    @Size(min = 1)
    @Schema(description = "Linhas de artigos da fatura (mínimo 1)", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<FaturaVendaItemDTO> items = new ArrayList<>();
}
