package cv.igrp.fatura.dashboard;

import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.ClienteRepository;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.FornecedorRepository;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.ProdutoRepository;
import cv.igrp.fatura.compra.infrastructure.persistence.repository.FaturaCompraRepository;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import cv.igrp.framework.stereotype.IgrpController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@IgrpController
@RestController
@RequestMapping(value = "api/v1/dashboard", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Estatísticas globais de faturação")
public class DashboardController {

    private final FaturaVendaRepository faturaVendaRepo;
    private final FaturaCompraRepository faturaCompraRepo;
    private final ClienteRepository clienteRepo;
    private final FornecedorRepository fornecedorRepo;
    private final ProdutoRepository produtoRepo;

    @GetMapping("/stats")
    @Operation(summary = "Obter estatísticas do dashboard (KPIs + Summary Strip)")
    public ResponseEntity<DashboardStatsDTO> getStats() {

        LocalDate hoje = LocalDate.now();
        LocalDate inicioMesAtual   = hoje.withDayOfMonth(1);
        LocalDate inicioMesAnterior = inicioMesAtual.minusMonths(1);

        // ── Venda ──────────────────────────────────────────────────────────────
        BigDecimal valorIliquido     = faturaVendaRepo.sumValorIliquido();
        BigDecimal valorImposto      = faturaVendaRepo.sumValorImposto();
        BigDecimal valorTotal        = faturaVendaRepo.sumValorFatura();
        BigDecimal vendasMesAtual    = faturaVendaRepo.sumValorFaturaBetween(inicioMesAtual, inicioMesAtual.plusMonths(1));
        BigDecimal vendasMesAnterior = faturaVendaRepo.sumValorFaturaBetween(inicioMesAnterior, inicioMesAtual);
        BigDecimal variacaoVendas    = calcVariacao(vendasMesAtual, vendasMesAnterior);
        Long totalFaturas            = faturaVendaRepo.countConfirmado();
        BigDecimal totalPorPagar     = faturaVendaRepo.sumValorPorPagar();

        // ── Compra ─────────────────────────────────────────────────────────────
        BigDecimal comprasMesAtual    = faturaCompraRepo.sumValorFaturaBetween(inicioMesAtual, inicioMesAtual.plusMonths(1));
        BigDecimal comprasMesAnterior = faturaCompraRepo.sumValorFaturaBetween(inicioMesAnterior, inicioMesAtual);
        BigDecimal variacaoCompras    = calcVariacao(comprasMesAtual, comprasMesAnterior);
        Long totalFaturasFornecedor      = faturaCompraRepo.countConfirmado();
        BigDecimal totalPorPagarCompras  = faturaCompraRepo.sumValorPorPagar();

        // ── Cadastro counts ────────────────────────────────────────────────────
        Long totalClientes     = clienteRepo.count();
        Long totalFornecedores = fornecedorRepo.count();
        Long totalProdutos     = produtoRepo.count();

        // ── Derived ────────────────────────────────────────────────────────────
        BigDecimal ganhoLucro    = vendasMesAtual.subtract(comprasMesAtual);
        BigDecimal ganhoAnterior = vendasMesAnterior.subtract(comprasMesAnterior);
        BigDecimal variacaoLucro = calcVariacao(ganhoLucro, ganhoAnterior);

        DashboardStatsDTO dto = new DashboardStatsDTO();
        dto.setTotalClientes(totalClientes);
        dto.setTotalFornecedores(totalFornecedores);
        dto.setTotalProdutos(totalProdutos);
        dto.setTotalVendas(vendasMesAtual);
        dto.setTotalDespesas(comprasMesAtual);
        dto.setGanhoLucro(ganhoLucro);
        dto.setVariacaoVendas(variacaoVendas);
        dto.setVariacaoDespesas(variacaoCompras);
        dto.setVariacaoLucro(variacaoLucro);
        dto.setValorIliquido(valorIliquido);
        dto.setValorImposto(valorImposto);
        dto.setValorTotal(valorTotal);
        dto.setTotalFaturas(totalFaturas);
        dto.setTotalValorPorPagar(totalPorPagar);
        dto.setTotalFaturasFornecedor(totalFaturasFornecedor);
        dto.setTotalValorPorPagarCompras(totalPorPagarCompras);

        return ResponseEntity.ok(dto);
    }

    private BigDecimal calcVariacao(BigDecimal atual, BigDecimal anterior) {
        if (anterior.compareTo(BigDecimal.ZERO) == 0) {
            return atual.compareTo(BigDecimal.ZERO) > 0 ? new BigDecimal("100.00") : BigDecimal.ZERO;
        }
        return atual.subtract(anterior)
                .divide(anterior, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);
    }
}
