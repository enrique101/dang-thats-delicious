import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
import typeAheaad from './modules/typeAhead'
import makeMap from './modules/map';

autocomplete($('#address'),$('#lat'),$('#lng'));
typeAheaad($('.search'));
makeMap($('#map'));