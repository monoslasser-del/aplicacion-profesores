/**
 * Todos los estados de México con sus municipios.
 * Fuente: INEGI (abreviado para MVP — municipios principales por estado).
 */
export const MEXICO_STATES: Record<string, string[]> = {
  "Aguascalientes": ["Aguascalientes","Asientos","Calvillo","Cosío","El Llano","Jesús María","Pabellón de Arteaga","Rincón de Romos","San Francisco de los Romo","Tepezalá"],
  "Baja California": ["Ensenada","Mexicali","Playas de Rosarito","Tecate","Tijuana"],
  "Baja California Sur": ["Comondú","La Paz","Loreto","Los Cabos","Mulegé"],
  "Campeche": ["Calkiní","Campeche","Carmen","Champotón","Escárcega","Hecelchakán","Hopelchén","Palizada","Tenabo"],
  "Chiapas": ["Berriozábal","Chiapa de Corzo","Comitán de Domínguez","Ocosingo","San Cristóbal de las Casas","Tapachula","Tonalá","Tuxtla Gutiérrez","Villaflores"],
  "Chihuahua": ["Chihuahua","Ciudad Juárez","Cuauhtémoc","Delicias","Hidalgo del Parral","Nuevo Casas Grandes","Ojinaga"],
  "Ciudad de México": ["Álvaro Obregón","Azcapotzalco","Benito Juárez","Coyoacán","Cuajimalpa de Morelos","Cuauhtémoc","Gustavo A. Madero","Iztacalco","Iztapalapa","La Magdalena Contreras","Miguel Hidalgo","Milpa Alta","Tláhuac","Tlalpan","Venustiano Carranza","Xochimilco"],
  "Coahuila": ["Acuña","Monclova","Piedras Negras","Saltillo","Torreón"],
  "Colima": ["Colima","Comala","Coquimatlán","Cuauhtémoc","Ixtlahuacán","Manzanillo","Minatitlán","Tecomán","Villa de Álvarez"],
  "Durango": ["Durango","Gómez Palacio","Lerdo","Nombre de Dios","Santiago Papasquiaro"],
  "Guanajuato": ["Acámbaro","Celaya","Guanajuato","Irapuato","León","Pénjamo","Salamanca","San Miguel de Allende","Silao","Valle de Santiago"],
  "Guerrero": ["Acapulco de Juárez","Chilpancingo de los Bravo","Iguala de la Independencia","Taxco de Alarcón","Zihuatanejo de Azueta"],
  "Hidalgo": ["Huejutla de Reyes","Ixmiquilpan","Mineral de la Reforma","Pachuca de Soto","Tizayuca","Tula de Allende"],
  "Jalisco": ["Guadalajara","Lagos de Moreno","Puerto Vallarta","Tepatitlán de Morelos","Tlaquepaque","Tonalá","Zapopan","Zapotlán el Grande"],
  "Estado de México": ["Atizapán de Zaragoza","Cuautitlán Izcalli","Ecatepec de Morelos","Naucalpan de Juárez","Nezahualcóyotl","Texcoco","Toluca","Tlalnepantla de Baz","Tultitlán"],
  "Michoacán": ["Lázaro Cárdenas","Morelia","Pátzcuaro","Uruapan","Zamora"],
  "Morelos": ["Cuernavaca","Cuautla","Jiutepec","Temixco","Yautepec"],
  "Nayarit": ["Bahía de Banderas","Compostela","Santiago Ixcuintla","Tuxpan","Tepic"],
  "Nuevo León": ["Apodaca","Escobedo","García","Guadalupe","Juárez","Monterrey","San Nicolás de los Garza","San Pedro Garza García","Santa Catarina"],
  "Oaxaca": ["Huajuapan de León","Juchitán de Zaragoza","Oaxaca de Juárez","Salina Cruz","San Juan Bautista Tuxtepec"],
  "Puebla": ["Atlixco","Cholula","Puebla","San Martín Texmelucan","Tehuacán"],
  "Querétaro": ["Corregidora","El Marqués","Jalpan de Serra","Querétaro","San Juan del Río"],
  "Quintana Roo": ["Benito Juárez (Cancún)","Cozumel","Felipe Carrillo Puerto","Othón P. Blanco","Solidaridad (Playa del Carmen)","Tulum"],
  "San Luis Potosí": ["Ciudad Valles","Matehuala","Rio Verde","San Luis Potosí","Soledad de Graciano Sánchez"],
  "Sinaloa": ["Ahome","Culiacán","Guasave","Mazatlán","Navolato"],
  "Sonora": ["Cajeme","Guaymas","Hermosillo","Navojoa","Nogales"],
  "Tabasco": ["Cárdenas","Centro (Villahermosa)","Comalcalco","Cunduacán","Huimanguillo","Macuspana"],
  "Tamaulipas": ["Altamira","Ciudad Madero","Matamoros","Nuevo Laredo","Reynosa","Tampico","Victoria"],
  "Tlaxcala": ["Apizaco","Chiautempan","Huamantla","Tlaxcala","Zacatelco"],
  "Veracruz": ["Boca del Río","Coatzacoalcos","Córdoba","Minatitlán","Orizaba","Tuxpan","Veracruz","Xalapa"],
  "Yucatán": ["Kanasín","Mérida","Progreso","Tekax","Tizimín","Umán","Valladolid"],
  "Zacatecas": ["Fresnillo","Guadalupe","Jerez","Zacatecas"],
};

export const ESTADOS = Object.keys(MEXICO_STATES).sort();

export function getMunicipios(estado: string): string[] {
  return MEXICO_STATES[estado] ?? [];
}
