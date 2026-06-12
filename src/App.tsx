import React, { useState, useRef } from "react";
import { Camera, Plus, Trash2, Clock, Users, ArrowRight } from "lucide-react";

interface Ingredient {
  id: string;
  name: string;
  amount: string;
}

interface Recipe {
  name: string;
  category: string;
  prepTime: number;
  yields: string;
  ingredients: Ingredient[];
  steps: string[];
  image: string | null;
}

export default function RecipeForm() {
  // Estados dos Campos Básicos (Critério 1)
  const [recipeName, setRecipeName] = useState("");
  const [category, setCategory] = useState("Massas");
  const [prepTime, setPrepTime] = useState("");
  const [yields, setYields] = useState("");

  // Estados de Ingredientes (Critério 2)
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingName, setIngName] = useState("");
  const [ingAmount, setIngAmount] = useState("");

  // Estados de Passos (Critério 3)
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState("");

  // Estado de Imagem (Critério 4)
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manipulação de Ingredientes
  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingName.trim()) return;

    const newIngredient: Ingredient = {
      id: crypto.randomUUID(),
      name: ingName.trim(),
      amount: ingAmount.trim() || "A gosto",
    };

    setIngredients([...ingredients, newIngredient]);
    setIngName("");
    setIngAmount("");
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  // Manipulação de Passos do Modo de Preparo
  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStep.trim()) return;

    setSteps([...steps, currentStep.trim()]);
    setCurrentStep("");
  };

  const handleRemoveStep = (indexToRemove: number) => {
    setSteps(steps.filter((_, index) => index !== indexToRemove));
  };

  // Manipulação de Imagem (Captura da Câmera / Galeria)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Persistência no LocalStorage (Critério Back-end)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipeName || !prepTime || !yields) {
      alert("Por favor, preencha os campos básicos da receita.");
      return;
    }

    const fullRecipe: Recipe = {
      name: recipeName,
      category,
      prepTime: Number(prepTime),
      yields,
      ingredients,
      steps,
      image,
    };

    // Salva no LocalStorage encadeando com as receitas antigas
    const existingRecipes = JSON.parse(localStorage.getItem("recipes") || "[]");
    localStorage.setItem("recipes", JSON.stringify([...existingRecipes, fullRecipe]));

    alert("🎉 Receita cadastrada com sucesso com armazenamento local!");
    
    // Reset do formulário completo
    setRecipeName("");
    setPrepTime("");
    setYields("");
    setIngredients([]);
    setSteps([]);
    setImage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans antialiased">
      {/* Header Focado em Mobile */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Nova Receita</h1>
        <p className="text-xs text-slate-500">Cadastre suas criações rapidamente</p>
      </header>

      <main className="mx-auto max-w-md px-4 mt-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* CRITÉRIO 4: Upload / Captura de Foto do Prato */}
          <div className="flex flex-col items-center justify-center">
            <input
              type="file"
              accept="image/*"
              capture="environment" // Força abertura direta da câmera no celular se clicado
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
            {image ? (
              <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                <img src={image} alt="Preview do prato" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute bottom-3 right-3 rounded-full bg-red-500 p-2 text-white shadow-md active:bg-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-40 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white text-slate-500 transition active:bg-slate-50"
              >
                <Camera size={32} className="mb-2 text-slate-400" />
                <span className="text-sm font-medium">Adicionar foto do prato</span>
                <span className="text-xs text-slate-400">Tire na hora ou use a galeria</span>
              </button>
            )}
          </div>

          {/* CRITÉRIO 1 & 5: Campos Básicos + Teclados Apropriados */}
          <div className="rounded-2xl bg-white p-4 shadow-sm space-y-4 border border-slate-100">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Nome da Receita</label>
              <input
                type="text"
                placeholder="Ex: Risoto de Cogumelos"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-slate-800 placeholder-slate-400 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-800 focus:border-orange-500 focus:outline-none"
              >
                <option value="Massas">Massas</option>
                <option value="Sobremesas">Sobremesas</option>
                <option value="Salgados">Salgados</option>
                <option value="Carnes">Carnes</option>
                <option value="Bebidas">Bebidas</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Tempo (min)</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric" // CRITÉRIO 5: Força teclado numérico puro no iOS/Android
                    pattern="[0-9]*"
                    placeholder="45"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-3 text-slate-800 placeholder-slate-400 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Rendimento</label>
                <div className="relative">
                  <Users size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ex: 4 porções"
                    value={yields}
                    onChange={(e) => setYields(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-3 text-slate-800 placeholder-slate-400 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CRITÉRIO 2: Lista de Ingredientes Dinâmica */}
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Ingredientes</h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ingrediente (ex: Farinha)"
                value={ingName}
                onChange={(e) => setIngName(e.target.value)}
                className="flex-[2] rounded-xl border border-slate-200 p-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
              <input
                type="text"
                placeholder="Qtd (ex: 200g)"
                value={ingAmount}
                onChange={(e) => setIngAmount(e.target.value)}
                className="flex-[1] rounded-xl border border-slate-200 p-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={handleAddIngredient}
                className="rounded-xl bg-orange-500 p-2.5 text-white shadow-sm active:bg-orange-600 flex items-center justify-center"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Listagem em Tela */}
            {ingredients.length > 0 && (
              <ul className="divide-y divide-slate-100 border-t border-slate-100 mt-2">
                {ingredients.map((ing) => (
                  <li key={ing.id} className="flex items-center justify-between py-2 text-sm text-slate-600">
                    <span>• {ing.name} <span className="font-semibold text-slate-800">({ing.amount})</span></span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(ing.id)}
                      className="text-slate-400 hover:text-red-500 active:text-red-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* CRITÉRIO 3: Modo de Preparo em Etapas */}
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Modo de Preparo</h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={`Passo ${steps.length + 1}`}
                value={currentStep}
                onChange={(e) => setCurrentStep(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 p-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={handleAddStep}
                className="rounded-xl bg-orange-500 px-3 py-2.5 text-white font-medium text-xs shadow-sm active:bg-orange-600 flex items-center gap-1"
              >
                Próximo <ArrowRight size={14} />
              </button>
            </div>

            {/* Listagem das Etapas */}
            {steps.length > 0 && (
              <ol className="space-y-2 mt-2">
                {steps.map((step, index) => (
                  <li key={index} className="flex items-start justify-between bg-slate-50 p-2.5 rounded-xl text-sm text-slate-700 border border-slate-100">
                    <span className="pr-2">
                      <strong className="text-orange-600">Passo {index + 1}:</strong> {step}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="text-slate-400 hover:text-red-500 active:text-red-600 p-1 mt-0.5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Botão de Gravação de Formulário Completo */}
          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 text-center font-bold text-white shadow-md active:opacity-90 transition transform active:scale-[0.99]"
          >
            Salvar Receita
          </button>

        </form>
      </main>
    </div>
  );
}