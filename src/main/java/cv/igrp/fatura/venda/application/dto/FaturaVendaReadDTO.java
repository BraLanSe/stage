package cv.igrp.fatura.venda.application.dto;

import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaEntity;
import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaItemEntity;
import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaItemImpostoEntity;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Data
public class FaturaVendaReadDTO {

    private Integer id;
    private String codigo;
    private String codigoReferencia;
    private LocalDate dtFaturacao;
    private LocalDate limitFaturacao;
    private LocalDate dtVencimentoFatura;
    private LocalDate dtConfirmacao;
    private String estado;
    private Boolean pago;
    private BigDecimal descontoFinanceiro;
    private BigDecimal descontoComercial;
    private BigDecimal valorIliquido;
    private BigDecimal valorImposto;
    private BigDecimal valorFatura;
    private BigDecimal valorPago;
    private BigDecimal valorPorPagar;
    private String termCondicoes;
    private String nota;
    private String utilizador;
    private String createdBy;
    private LocalDateTime createdDate;
    private TipoFaturaInfo tipoFatura;
    private SerieInfo prSerie;
    private ClienteInfo cliente;
    private List<ItemInfo> items;

    @Data
    public static class TipoFaturaInfo {
        private Integer id;
        private String codigo;
        private String desig;
    }

    @Data
    public static class SerieInfo {
        private Integer id;
        private String codigo;
        private String desig;
    }

    @Data
    public static class ClienteInfo {
        private Integer id;
        private String codigo;
        private String desig;
        private String nif;
        private String email;
        private String telefone;
        private String endereco;
    }

    @Data
    public static class ItemInfo {
        private Integer id;
        private Integer numLinha;
        private String desig;
        private String descr;
        private BigDecimal quantidade;
        private BigDecimal precoUnitario;
        private String codigoArtigo;
        private BigDecimal descontoComercialPerc;
        private BigDecimal descontoComercialValor;
        private BigDecimal descontoFinanceiroPerc;
        private BigDecimal descontoFinanceiroValor;
        private BigDecimal valorBruto;
        private BigDecimal valorLiquido;
        private BigDecimal valorImposto;
        private BigDecimal valorTotal;
        private Integer contaGlId;
        private String estado;
        private List<ImpostoInfo> impostos;
    }

    @Data
    public static class ImpostoInfo {
        private Integer id;
        private String tipoCalculo;
        private BigDecimal taxa;
        private BigDecimal valorFixo;
        private BigDecimal baseCalculo;
        private BigDecimal valorImposto;
        private Integer contaGlId;
        private Integer ordem;
    }

    public static FaturaVendaReadDTO from(FaturaVendaEntity e) {
        FaturaVendaReadDTO dto = new FaturaVendaReadDTO();
        dto.setId(e.getId());
        dto.setCodigo(e.getCodigo());
        dto.setCodigoReferencia(e.getCodigoReferencia());
        dto.setDtFaturacao(e.getDtFaturacao());
        dto.setLimitFaturacao(e.getLimitFaturacao());
        dto.setDtVencimentoFatura(e.getDtVencimentoFatura());
        dto.setDtConfirmacao(e.getDtConfirmacao());
        dto.setEstado(e.getEstado());
        dto.setPago(e.getPago());
        dto.setDescontoFinanceiro(e.getDescontoFinanceiro());
        dto.setDescontoComercial(e.getDescontoComercial());
        dto.setValorIliquido(e.getValorIliquido());
        dto.setValorImposto(e.getValorImposto());
        dto.setValorFatura(e.getValorFatura());
        dto.setValorPago(e.getValorPago());
        dto.setValorPorPagar(e.getValorPorPagar());
        dto.setTermCondicoes(e.getTermCondicoes());
        dto.setNota(e.getNota());
        dto.setUtilizador(e.getUtilizador());
        dto.setCreatedBy(e.getCreatedBy());
        dto.setCreatedDate(e.getCreatedDate());

        if (e.getTipoFatura() != null) {
            TipoFaturaInfo t = new TipoFaturaInfo();
            t.setId(e.getTipoFatura().getId());
            t.setCodigo(e.getTipoFatura().getCodigo());
            t.setDesig(e.getTipoFatura().getDesig());
            dto.setTipoFatura(t);
        }
        if (e.getPrSerie() != null) {
            SerieInfo s = new SerieInfo();
            s.setId(e.getPrSerie().getId());
            s.setCodigo(e.getPrSerie().getCodigo());
            s.setDesig(e.getPrSerie().getDesig());
            dto.setPrSerie(s);
        }
        if (e.getCliente() != null) {
            ClienteInfo c = new ClienteInfo();
            c.setId(e.getCliente().getId());
            c.setCodigo(e.getCliente().getCodigo());
            c.setDesig(e.getCliente().getDesig());
            c.setNif(e.getCliente().getNif());
            c.setEmail(e.getCliente().getEmail());
            c.setTelefone(e.getCliente().getTelefone());
            c.setEndereco(e.getCliente().getEndereco());
            dto.setCliente(c);
        }
        dto.setItems(e.getItems() == null ? Collections.emptyList()
                : e.getItems().stream().map(FaturaVendaReadDTO::mapItem).toList());
        return dto;
    }

    private static ItemInfo mapItem(FaturaVendaItemEntity item) {
        ItemInfo info = new ItemInfo();
        info.setId(item.getId());
        info.setNumLinha(item.getNumLinha());
        info.setDesig(item.getDesig());
        info.setDescr(item.getDescr());
        info.setQuantidade(item.getQuantidade());
        info.setPrecoUnitario(item.getPrecoUnitario());
        info.setCodigoArtigo(item.getCodigoArtigo());
        info.setDescontoComercialPerc(item.getDescontoComercialPerc());
        info.setDescontoComercialValor(item.getDescontoComercialValor());
        info.setDescontoFinanceiroPerc(item.getDescontoFinanceiroPerc());
        info.setDescontoFinanceiroValor(item.getDescontoFinanceiroValor());
        info.setValorBruto(item.getValorBruto());
        info.setValorLiquido(item.getValorLiquido());
        info.setValorImposto(item.getValorImposto());
        info.setValorTotal(item.getValorTotal());
        info.setContaGlId(item.getContaGlId());
        info.setEstado(item.getEstado());
        info.setImpostos(item.getImpostos() == null ? Collections.emptyList()
                : item.getImpostos().stream().map(FaturaVendaReadDTO::mapImposto).toList());
        return info;
    }

    private static ImpostoInfo mapImposto(FaturaVendaItemImpostoEntity imp) {
        ImpostoInfo info = new ImpostoInfo();
        info.setId(imp.getId());
        info.setTipoCalculo(imp.getTipoCalculo());
        info.setTaxa(imp.getTaxa());
        info.setValorFixo(imp.getValorFixo());
        info.setBaseCalculo(imp.getBaseCalculo());
        info.setValorImposto(imp.getValorImposto());
        info.setContaGlId(imp.getContaGlId());
        info.setOrdem(imp.getOrdem());
        return info;
    }
}
