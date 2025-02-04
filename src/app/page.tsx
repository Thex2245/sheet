'use client'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRef } from "react";
import { utils, read } from 'xlsx';
import { unparse } from 'papaparse';
import { Check } from "lucide-react";

interface User{
  NOME: string,
  TELEFONE: string
}

export default function Home() {
  const turmaRef = useRef<HTMLInputElement | null>(null);
  const planilhaRef = useRef<HTMLInputElement | null>(null);

  function click(){
    const turmaValue = turmaRef.current?.value
    const turma = 'T' + turmaValue
    const file = planilhaRef.current?.files?.[0]

    if(!file && !turmaValue){
      alert('Erro: O arquivo XLSX e número de turma não foram informados.')
      return
    }

    if(!turmaValue){
      alert('Erro: O número da turma não foi informada.')
      return
    }

    if(!file){
      alert('Erro: O arquivo XLSX não foi informado.')
      return
    }
    
    if (file) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file as Blob);

      reader.onload = (e) => {
        const bufferArray = e.target?.result;
        const workbook = read(bufferArray, { type: "buffer" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData: User[] = utils.sheet_to_json(sheet);

        const data = [
          ['First Name','Mobile Phone']
        ];

        jsonData.map((row: User) => {
          const nome = row.NOME;
          const tel = row.TELEFONE;
          const nomeFormatado = formatNameWithClass(nome, turma);
          data.push([nomeFormatado, tel])
        })
        const csv = unparse(data);
        downloadCSV(csv);
      };
    }
  }

  function formatNameWithClass(name: string, turma: string): string {
    // Quebra a string pelo espaço para separar o nome e sobrenome
    const nameParts = name.split(" ");
    
    // Pega o primeiro nome e o último sobrenome
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
  
    // Retorna a string formatada com o nome, sobrenome e turma
    const nameComplete = `${firstName} ${lastName} ${turma}`
    return nameComplete;
  }

  const downloadCSV = (csv: string) => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
  const day = String(today.getDate()).padStart(2, '0');

  const currentDate = `${year}-${month}-${day}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contatos-${currentDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // const a2 = document.createElement('a');
    // a2.href = 'https://contacts.google.com/'
    // document.body.appendChild(a2);
    // a2.click();
    // document.body.removeChild(a2);
  };

  return (
    <Card className="w-[350px] mx-auto">
    <CardHeader>
      <CardTitle>Lista de Contatos</CardTitle>
      <CardDescription>Crie uma lista de contatos apartir de uma planilha Excel.</CardDescription>
    </CardHeader>
    <CardContent>
      <form>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="turma">Turma</Label>
            <Input id="turma" placeholder="Qual número da turma?" type="number" ref={turmaRef}/>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="file">Planilha</Label>
            <Input id="file" type="file" accept=".xlsx" ref={planilhaRef}/>
          </div>
        </div>
      </form>
    </CardContent>
    <CardFooter className="flex justify-center">
      <Button type="submit" onClick={click}><Check/>Enviar</Button>
    </CardFooter>
  </Card>
  );
}
