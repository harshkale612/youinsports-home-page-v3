/**
 * The 800 largest cities on Earth, as polyline-encoded lat/lng pairs plus a
 * log-scaled brightness. Painted as additive glows into the night-lights map so
 * the dark side of the globe shows real population clusters — the Nile, the
 * Indo-Gangetic plain, the eastern seaboard — instead of generic noise.
 *
 * Source: GeoNames (cities500), filtered to population > 300k.
 */

function decode(encoded: string, precision: number): number[] {
  const out: number[] = [];
  let index = 0;
  let value = 0;

  while (index < encoded.length) {
    let shift = 0;
    let chunk = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      chunk |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    value += chunk & 1 ? ~(chunk >> 1) : chunk >> 1;
    out.push(value / precision);
  }

  return out;
}

const ENCODED_COORDS = "hkFiub@hob@qih@p}g@q{`@j{`@`dC{eCpsCswCisJbsJefIxeIwcc@dac@lgFsjF`lDirDyz[lw[zkEotEncCqdCq{J`zJavJrhJcgb@fab@{rIfqIiqIzpI_rIppI}lJzlJclJvjJapIjnIymIpmI~sC{tCfiEgsE|mCynChoCmoCjpCqpCvtC_uCdoC}pC|lCsnCt}Bu}B|uCuvCf_Cm_Ch`CejCleDajDxtEaxEbuCsuCwtI|nIi~KpwKopHfpHtzGg}GzoHgtHpjEukExaImbIrwIo{Im|Hl|H|gEgjEcpGhnG}rIvkIoiHhcHl~Cq_Di_GrzFvuKyuKduKqwKssFtmFcaFrzE|aDcgD}hCvgCeeWfbWrfD_gDdzLszLtfDcgDypVboVwwVjuVeqUtpU_mVblVllDemDy|Uj|UyjUdjUa_Hr}GscUrcU{{UtzUsbU|aUiaU|`UsbUnbUsaUlaUa`U~_U}dGzdGozGjzGyxDtxDu|Th{T_pDhoDzvDcyDyrT`qTsiWfiWtjFslF_gBddBwyBjyBeyBxwBepGbnGrxEwzEskEziEvbJ{cJ}_Tn}S`dGcdGk|Ed|EybE~`EpdNcfNagE~cE~dHcfHcmF`mFcaVb_VcxRfuRg~Ur|UhhNokNmvEdvEshEdhEsw@xv@eyCdyCwuRxqR}aS`aS_`Sz~Ri~RvzRsmG`gGgfRbfRsfRlfR}fRzfR{eRbdRtrNssNiqQnoQyn@tm@ib@j`@uwAhvAczQ|yQxjN{kN}LzJcMrKly@{y@~y@sz@m@d@~b@mf@cgV~fVt]y]_CjBj~Nu~NziBcjBlCsCtWcXsEpEbRsS|r@it@wnUvmU{cVhcVxVyVg|U~{Uw{Ul{UzKuLtTsVnnAooAnW{WpuNixNtzLo{LauU~tU{jLzjLxfC{fCvWeY}mLblLyxDpxDvHwKdpCepCbpCorCgiLdiLnEwEk}K||KmuQhuQjoN{oNtrMyrMngNmhN|A_BydUhdUxwOkxOpbNybNhR_S`aOebOggLfgLyuQ`uQgvQ`vQ|vOawOeiQ`iQg{KrzKdTgT}|Kp|Kv_BcbBofQ|eQu~Kd~KecLlbLeGfFvTmUiQdQzeR}fRcqKtpKzuAkwAt_Cw`CshElgE{rKvrKt`@ca@zo@ap@}bLh`LffAufAg}Dd|De}Ox{Oy{Db{D`xRqzR{xSrxS_ySpxSmxSjxS{wStwSqxSnxSdpSgpS_xS~wSowSfwSxgE{gEewSxvS|gEehE}nDrnD`_EebEstJrtJksDjrDbfSkfSciBphBghBdhBohBzeB}~Pn}P_pK~nKsxPhxP{oK~mK}nNjkNw|J|zJ_kJ|jJoxKdxK}xKfwKloQmoQ{_Kh_K|sE}tEkyP~wPfgPkgPbgPegPbhPghP{xIvxI~vPowP{wIzwI}wIrwI{~On|Oz{U_|UioInnI_oIznIsoIpoIwjKtjK{oInoI_oI~nIumIhmIbcVkcV`cVgcV~cVcdVjrPmrPmlIhlI~dVaeVfdV}dVrdVgeVnrVyrVk|M`|MixOxwOsyIzxIeoI~nIosP~qPwxKvvKbsVusVdfWmfWtfWqgWkwOtvOdrTorTcqOlpOn~Vs~VaiJ|hJbbTibTuaInaIoxJnxJglP~kPuvBtuB_rBrqBsmBnlBwlPpkPcrP~qP~fWqgWenMbnMu|Or{On`WiaWqyPpyPi}Pf}Pa}P`}PcnH`nHe}H||HiqL`qLksPnrP{vPtvP_{P~zPyyPvyPgzKbzK{yKzyKstPjtPqaRnaR_bPlaP}jIljIekKbkKe`Lb`LkuOttO}kPpkPs~Ql~QavP~uPwtHvtHcrP~qPymPlmPuyPryPm{Ol{OirPfrPlrSurS{aJjaJmqI`qIkcQdcQibKfbKifQreQifLdfLycPlcPecQ|bQuxEfxEadQvcQimPfmP{_Lr_LeuOztOmfKzeKcdOlcOc~Kd}KizQ`zQidEtcE}|Pv|PyrOnrOmpKfpKy_Pn_PezD`zDs}Ap}A_hQ|gQk}Ab|AuhC~gC{iPziPdyXiyX}hQthQmfGbfGohQtgQodNldN_zQ|yQoyQlyQu}Pr}P}{Dt{DwmMjmMs{H~zHkrObrOqgJngJ_{DpzDskGlkG`uWcuWygQxgQo_Jf_JkhN~gN~dXieXesJrrJbrWcrWnrW}rW{kKpkKe`Pz_PwkPljPyeQ`eQyxKnxKscIncI_qNzpNccHvbHgmBtlBmsOjsO}rCtrCwoI`oI{sNxsNotMntM_hNzfNw`Jh`J_qItpIyvOrvOmpHxnHw|Hj|HkmO~lOmfNhfNo|MrzM}yOnyOcnN`nNcgJrfJocQjcQq_Pj_PgtOftOa|O|{OqrOjrOuxHdxHigP`gPebQdaQeuO|tOypOvoOc~H|}Har@~q@spHjpHinPfnPqnHzmHsjOjjOimHbmH`iYciYsnHpnHybQvbQyoHvoHy_Ph_PgyMvxMcwH`wHolHflHk}M||M}pPxpPqoHfoHucOhcOjjZojZytPnsPgvPbvPovMhvMgjO`jOggGbgGl~Ws~W{_Hx_HetPpsPg`Nb`NwvMpvMgnCtmCkzO~yO~lWwmW}{Pj{P_OzNi_Qf_QcuP`uPoFlFyvPtvPglMblMmF`FypMvpM_FtEexPdxPceF~dF_aGt`G_qOzpO`_Xe_XupPlpP|zTa{To~Nd~NaoO|nObyFmyFa{MxzM}jB|jB{{Ol{OajOniOwiMniMqvNjvNy~Gv~GoqPlqPgdN~cNouMjuMucNjcNslPjlP{wGvwGueOpeOycPtbPyhMjhM~FaGq{Mn{M_sPtrPmEfEcmP~lPokBlkBqsGlsGg_Pd_P{gPvgPynPpnPmcGfcGgoPboPqhM~gMmjGjjGoiPdiPkmGhmGtvFyvFykPpkPs}Ol}Or~Yw~Y{pOvpO`_Zc_ZqTpTcfPvePesF~rF{tOxtOeiP|hPegPzfP}WnWgjPdjPssNnsN_}O||OcX~Ws|Fn|FfjAijAe_O|~NueGjeGi`Pr_PkxOzwO__Pl~OkaPjaPweGteGje\\cf\\gfAdfAinOhnOn|[s|[igNhgN{uBtuBc|Mz{Mvg\\yg\\xkXclX|hXciXwbRfbRbzBezBgeO~dOsnOjnOqyNnyNajF`jFcpNpoNcmMtkM}bAvbAcdA~cAo}O||Onl[{l[kP`P_vNxuNn`Go`G}tOztOquFpuFc|Qz{Q{gOfgOgpNpoNg}Q`}Qy~Nv~NaItHenO`nOsdOjdOyiFxiFf~Fk~F}qN|qN|rFasFxv\\yv\\h~Fq~Fo}Fx|FgfOzeOuqMdqMwoMpoMmfMlfMksFdsFycRncRozNdzNysMrsMowEdwEw{Lv{LquRluR{oOroOodBldBokRjkRaeN~dNsnFpnFasR`sRauR~tR}bSxbSqKhKalN|kNqtAptAq|Ml|M}oNpoNycO`cOgeS~dSqtRptRyyMpyMogOfgOajQviQq|Pj|PyzRvzRijNdjNi}Md}MltUmtUagQ~fQofNnfNmtNjsNizNdzNkjSbjSd~Xe~Xwv@lv@gjSdjSs@p@ciQ~hQ_jS~iSu|@r|@}fSvfSggSfgSglStkS_iS~hSiaBfaBbbFebFq`Md`MxbGecGw}An}AobQfbQmgSzfSghOzgOsfLrfL_nOxmOmvMjvMghNxgNl_Wo_Wy_Nv_NyxNxxN{o@zo@e|Nb|N_EjDupClpCki@hi@}wPhwPepNdoNweNreNavK~uKyvPrvPauNxtN}aOxaOfqEsqE}zNvzNpeDcfDxe@if@jIyI_A~@}bNnaNwoPloPdb^kb^awN~vN|mGinGsoPpoPglNdlNylPxlPmyNhyNwkOrkO_mP|lPwoOtoOckMxjMymPfmPklPflPetMrsMdh^wh^cxM`xMyqMxqMt`@}`@mMjM_wR|vRksKfsKu~Bb~Bw|Mn|Mir@bq@g`Sv_SDQleAyeAwfLhfL_|DxzDfScTu}Mn}MrsUusUycOjcOidL~cL_}Oh|OwfNtdN`xFkxFmaNz`NquLjuL{iNfiNng[ug[`rWcrWzx@uy@a}M`}MqGnGbk@ck@dk@ik@ypNvpNlnUonUn_Wi`WohM|gMaZ|YrdAweAmz@dz@vrGetGfkUgkUmoLfoLvjU}jU~kUelUq_Ln_LqsNjsNidEhdEanM`nMdlUklUwyLnyL~kU_lUbeDafDu~Dr~DjjAqjAbkAskAu~Nx}NwmDtmD{~Nv~NobOzaOdtF{uFzhGaiGsR~Qg}Nz|NjhXshXy_Ox_OrvDmwDwpN|nNqiDbgDbxBeyBgeE~cEgeRbdRkqE`qE~kFwmFfaWabWl`W_aWwpGlpG}cO|cOh~Co~C_|NpxNnqBysB`wCsxC|d@ae@rhFwjF|sVgtVtaF_bFjgV{hVsxN~sNlaB_bBciNbeN|m@un@{}Mx}MkeOldOzpDqqDbe`@sf`@pnA}nAqoJznJz~@s_AncF}cF~eEsgE|rAmtAhYeZraHygHj`Ds`D|u[qv[xtAiuAf{Dm{D|}Ee`Fp{Ba~BraHcbHzqGsrGbg_@_j_@vaI}aIta@ob@~lAsmAzhEyiEngHmiHbbE_cEvgHmhHzrIcsIlsFwwFdR}RjsJstJbYgYzr_@{r_@foGmqGpcDyhDuFbE{qBtqBmmDplDef@|b@llG{lGhpBqpBth@gj@qeFvcF`lAkoAoV|UflEomEks@~m@~IgRz`GodGfrHmrHdxD";

const ENCODED_WEIGHTS = "aCv@@Fe@l@cAEDfAg@BNc@|@u@z@e@kAxA@Yf@c@J^}B|B@URcBrAJAFKo@z@]EGb@[K^Bg@?n@Og@|@]oAv@l@Kk@z@@KY\\FA}@x@_@Qc@dACWPYu@`Ah@Bq@p@YLIITGyB|AT_@r@o@LXGLu@d@Ko@pAKBu@PB^OBAgArAo@v@CYVo@?ZAV@gBx@ZkAbAPa@j@q@NKJEj@O{BnAh@[h@SCVgA`ADAIJC?MKk@NNAJNHYFR_@d@M@u@T@XuBjB@Ni@`@@@WV[RcAx@N@k@Wz@{ApBScAx@LkAtACF[R]XCq@XSx@GFSF_@f@g@@ZIZ_@F}@SvAAUXLWDa@r@?cAh@MJTa@yAtAP@ANBe@VkBfB?NOMb@IBOI]t@YDCYb@uAhASl@iA`AM^c@q@x@?XUCXq@u@zAOKc@lAkAcAz@?`AWSj@[NCi@NNiAROlA[j@wBxA\\U^Ku@x@Lg@d@c@@oAjBKV{@At@GOZKYLw@dAaA|@JY}AzAi@_@\\z@y@~@CSLSCl@c@NK\\e@h@WBHe@]|@CLMNMIc@Cz@U\\y@b@m@`@ZQNCe@NRBMBBHOg@\\c@~@Ba@JHOCPoBxAH]l@DCIBKGX[?FHBUDm@_@nA?B_@ShAIk@[lAOaBhBMECMp@MeBbBARAIQTqBKdBNIKG`@EUXF@wAt@{BzCaB|AAYFUYbA[}An@z@DWd@_@Cf@Ow@`AsAv@INYVwAlBGHU_@j@H_@AXa@TMRu@b@XUNKXYMZJ[KXB{A`A?@Fm@PM^?T@QMLJaAn@J@s@|@IA{AbBM\\UKJy@x@Ng@b@H[\\a@[v@@kAhAFa@RJa@b@_AGf@Wb@PKEFSBq@lASQb@SPGF?MeBL`Bk@^MUXJq@e@xAGTWO@Ta@CLDFCI^iA`@EMbA]KGj@QFPAKLcAp@c@j@?}@q@dBGPDoAp@Ib@ILkAl@JLy@\\b@a@]|@wAtAaAw@rBAc@WbAGBmCnCAaAbA_@V_@Tk@l@o@DJC{@fAZJ@a@SVPJkCfC[Ml@OWf@QuAj@ZUt@W@Ha@?b@F{@CTj@uAh@PLBGMKo@hAUNJFe@b@BGCMMXAa@n@A[ZQg@l@@MuAhBILE]d@Sq@p@BPO[BPAML@aB|ADEG^AKQLgA";

export type CityLight = {
  lat: number;
  lng: number;
  /** 0..1 — drives glow radius and intensity. */
  weight: number;
};

let cached: CityLight[] | null = null;

export function getCityLights(): CityLight[] {
  if (!cached) {
    const coords = decode(ENCODED_COORDS, 100);
    const weights = decode(ENCODED_WEIGHTS, 1);
    cached = weights.map((weight, i) => ({
      lat: coords[i * 2],
      lng: coords[i * 2 + 1],
      weight: weight / 99,
    }));
  }
  return cached;
}
