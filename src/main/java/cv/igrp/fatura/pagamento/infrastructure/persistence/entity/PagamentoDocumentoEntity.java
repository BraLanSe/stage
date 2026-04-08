package cv.igrp.fatura.pagamento.infrastructure.persistence.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import cv.igrp.fatura.shared.config.AuditEntity;
import cv.igrp.framework.stereotype.IgrpEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@IgrpEntity
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pagamento_documento")
public class PagamentoDocumentoEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pagamento_id", nullable = false)
    private PagamentoEntity pagamento;

    @Column(name = "fatura_venda_id")
    private Integer faturaVendaId;

    @Column(name = "fatura_compra_id")
    private Integer faturaCompraId;

    @NotNull
    @Column(name = "valor_aplicado", nullable = false, precision = 18, scale = 2)
    private BigDecimal valorAplicado;

    @Column(name = "desconto_financeiro_aplicado", precision = 18, scale = 2)
    private BigDecimal descontoFinanceiroAplicado;

    @Column(name = "regularizacao_ref_cod", length = 50)
    private String regularizacaoRefCod;

    @Column(name = "dt_registo")
    private LocalDateTime dtRegisto;
}
