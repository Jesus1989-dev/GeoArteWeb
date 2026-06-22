export { getHomePageData, type HomePageData } from "./home.service";
export { getDashboardData, type DashboardPageData } from "./dashboard.service";
export { getMapaData, type MapaPageData } from "./mapa.service";
export {
  getContactoPageData,
  getContactoCurlData,
  type ContactoPageData,
  type ContactoCurlData,
} from "./contacto.service";
export { getReportesPageData, type ReportesPageData } from "./reportes.service";
export { getAdminPageData, type AdminPageData } from "./admin.service";
export { getPerfilPageData, type PerfilPageData } from "./perfil.service";
export { getInvestigacionPageData, getRecursoCualitativoById } from "./investigacion.service";
export type { InvestigacionPageData } from "@/lib/domain/investigacion";
export { getPoliticasPageData, type PoliticasPageData } from "./politicas.service";
export {
  getSobreElProyectoPageData,
  type SobreElProyectoPageData,
} from "./sobre-el-proyecto.service";
