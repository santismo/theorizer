import {chordConnection} from '@/lib/chord-connection';
import {type Chord} from '@/lib/harmony';
export function ChordConnection({previous,current,keyCenter,mode,showPair=true}:{previous?:Chord;current?:Chord;keyCenter:number;mode:string;showPair?:boolean}){
 const connection=chordConnection(previous,current,keyCenter,mode);if(!connection)return null;
 return <div className="chord-connection" aria-label={`Suggested connection from ${connection.from} to ${connection.to}`} title="One possible connection. A chord change alone does not establish a modulation.">{showPair&&<span className="connection-pair">{connection.from} → {connection.to}</span>}<p><strong>{connection.technique}.</strong> {connection.detail}</p></div>
}
