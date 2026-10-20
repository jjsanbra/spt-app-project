# Delta Funcional: Ampliación del Catálogo de Deportes (`expand-sports-catalog`)

## 1. Catálogo Completo de Deportes
El sistema soportará los siguientes valores en el enum `SportType`:

| Clave Enum | Nombre Español | Ámbito Habitual |
| :--- | :--- | :--- |
| `PADEL` | Pádel | Club / Polideportivo |
| `TENNIS` | Tenis | Club / Polideportivo |
| `FOOTBALL_7` | Fútbol 7 | Campo exterior / césped |
| `FOOTBALL_11` | Fútbol 11 | Campo exterior / césped |
| `FUTSAL` | Fútbol Sala | Pabellón cubierto municipal |
| `BASKETBALL` | Baloncesto | Pabellón cubierto / canchas |
| `PICKLEBALL` | Pickleball | Pista dura / raqueta moderna |
| `SQUASH` | Squash | Cabinas cerradas |
| `BADMINTON` | Bádminton | Pistas de parqué / pabellón |
| `VOLLEYBALL` | Voleibol | Pistas de pabellón |
| `BEACH_VOLLEY` | Vóley Playa | Pistas de arena al aire libre |
| `FRONTON` | Frontón | Instalación de pelota al aire libre |
| `INDOOR_FRONTON` | Frontón Cubierto | Frontón cerrado municipal |
| `HANDBALL` | Balonmano | Pabellón polideportivo municipal |
| `TABLE_TENNIS` | Tenis de Mesa | Salas deportivas / polivalentes |
| `ATHLETICS_TRACK` | Pista de Atletismo | Anillo de atletismo exterior |
| `SWIMMING_LANE` | Calle de Natación | Piscina climatizada / verano |
| `CLIMBING_WALL` | Rocódromo / Escalada | Torre o pared de escalada |
| `MULTI_SPORT` | Polideportivo / Multideporte | Espacio polivalente municipal |

---

## 2. Consumo en Microfrontends
- Todos los formularios de alta/edición de pista (`spt-admin`) y filtros de búsqueda de disponibilidad y partidas abiertas (`spt-portal`) deben permitir seleccionar cualquiera de los deportes traducidos.
