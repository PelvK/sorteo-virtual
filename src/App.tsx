import { useState, useEffect, useCallback } from "react";
import { Play, Square, Users } from "lucide-react";
import { ZoneGrid } from "./components/ZoneGrid";
import { BallCage } from "./components/BallCage";
import { ControlPanel } from "./components/ControlPanel";
import { CategoryConfigPanel } from "./components/CategoryConfig";
import { GroupsDisplay } from "./components/GroupsDisplay";
import { DrawConfig, Zone, CategoryConfig } from "./types";
import { supabase } from "./lib/supabase";
import "./App.css";
import { BACKGROUND_BALL_IMAGE } from "./const";

const CATEGORY_CONFIGS: CategoryConfig[] = [
  { year: 2010, numZones: 6, ballCageTeams: [6, 6, 6, 6] },
  { year: 2011, numZones: 6, ballCageTeams: [6, 6, 6, 6] },
  { year: 2012, numZones: 6, ballCageTeams: [6, 6, 6, 6] },
  { year: 2013, numZones: 6, ballCageTeams: [6, 6, 6, 6] },
  { year: 2014, numZones: 6, ballCageTeams: [6, 6, 6, 6] },
  { year: 2015, numZones: 6, ballCageTeams: [6, 6, 6, 6] },
  { year: 2016, numZones: 6, ballCageTeams: [6, 6, 6, 6] },
  { year: 2017, numZones: 6, ballCageTeams: [6, 6, 6, 6] },
  { year: 2018, numZones: 6, ballCageTeams: [6, 6, 6, 6] },
];

const INITIAL_CONFIG: DrawConfig = {
  numZones: 6,
  ballCages: [[], [], [], []],
  drawOrder: [],
  category: 2010,
  drawMode: "manual",
};

function App() {
  const [config, setConfig] = useState<DrawConfig>(INITIAL_CONFIG);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawIndex, setCurrentDrawIndex] = useState(0);
  const [activeCage, setActiveCage] = useState<number | null>(null);
  const [currentTeam, setCurrentTeam] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<number>(2010);
  const [categoryConfigs, setCategoryConfigs] =
    useState<CategoryConfig[]>(CATEGORY_CONFIGS);
  const [currentDrawOrder, setCurrentDrawOrder] = useState<string[]>([]);
  const [optionVisible, setOptionVisible] = useState<boolean>(false);
  const [showGroups, setShowGroups] = useState<boolean>(false);

  useEffect(() => {
    loadCategoryConfigs();
  }, []);

  useEffect(() => {
    initializeZones(config.numZones);
    loadConfig(currentCategory);
  }, [currentCategory]);

  useEffect(() => {
    if (zones.length !== config.numZones) {
      initializeZones(config.numZones);
    }
  }, [config.numZones]);

  const initializeZones = (numZones: number) => {
    const zoneLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const newZones: Zone[] = Array.from({ length: numZones }, (_, i) => ({
      id: `zone-${i}`,
      name: `Zona ${zoneLabels[i]}`,
      teams: [null, null, null, null],
    }));
    setZones(newZones);
  };

  const loadCategoryConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("category_configs")
        .select("*")
        .order("year", { ascending: true });

      if (error) {
        console.error("Error loading category configs:", error);
        return;
      }

      if (data && data.length > 0) {
        const loadedConfigs = data.map((d) => ({
          year: d.year,
          numZones: d.num_zones,
          ballCageTeams: d.ball_cage_teams,
        }));
        setCategoryConfigs(loadedConfigs);
      }
    } catch (error) {
      console.error("Error loading category configs:", error);
    }
  };

  const loadConfig = async (category: number) => {
    try {
      const categoryConfig = categoryConfigs.find((c) => c.year === category);

      const { data, error } = await supabase
        .from("draw_configs")
        .select("*")
        .eq("category", category)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error loading config:", error);
      }

      if (data) {
        setConfig({
          numZones: categoryConfig ? categoryConfig.numZones : data.num_zones,
          ballCages: data.ball_cages,
          drawOrder: data.draw_order,
          category: data.category,
          drawMode: data.draw_mode || "manual",
        });
      } else {
        if (categoryConfig) {
          setConfig({
            numZones: categoryConfig.numZones,
            ballCages: [[], [], [], []],
            drawOrder: [],
            category: category,
            drawMode: "manual",
          });
        }
      }
    } catch (error) {
      console.error("Error loading config:", error);
    }
  };

  const saveConfig = async (newConfig: DrawConfig) => {
    try {
      const { error } = await supabase.from("draw_configs").insert({
        num_zones: newConfig.numZones,
        ball_cages: newConfig.ballCages,
        draw_order: newConfig.drawOrder,
        category: newConfig.category || currentCategory,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving config:", error);
    }
  };

  const handleConfigChange = (newConfig: DrawConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const handleCategoryChange = (category: number) => {
    setCurrentCategory(category);
    handleReset();
  };

  const handleCategoryConfigsChange = (newConfigs: CategoryConfig[]) => {
    setCategoryConfigs(newConfigs);
    const currentCategoryConfig = newConfigs.find(
      (c) => c.year === currentCategory
    );
    if (
      currentCategoryConfig &&
      currentCategoryConfig.numZones !== config.numZones
    ) {
      setConfig({
        ...config,
        numZones: currentCategoryConfig.numZones,
      });
    }
  };

  const handleStartDraw = () => {
    if (config.ballCages.flat().length === 0) return;

    initializeZones(config.numZones);
    setCurrentDrawIndex(0);
    setIsDrawing(true);

    let orderToUse: string[];
    if (config.drawMode === "random") {
      orderToUse = [];
      config.ballCages.forEach((cage) => {
        const shuffledCage = [...cage].sort(() => Math.random() - 0.5);
        orderToUse.push(...shuffledCage.map((t) => t.id));
      });
    } else {
      orderToUse = config.drawOrder;
    }

    processNextDraw(0, orderToUse);
  };

  const processNextDraw = (index: number, drawOrder?: string[]) => {
    const orderToUse = drawOrder || currentDrawOrder;
    if (drawOrder) {
      setCurrentDrawOrder(drawOrder);
    }

    if (index >= orderToUse.length) {
      setIsDrawing(false);
      setActiveCage(null);
      setCurrentTeam(null);
      return;
    }

    const teamId = orderToUse[index];
    const team = config.ballCages.flat().find((t) => t.id === teamId);

    if (!team) {
      processNextDraw(index + 1);
      return;
    }

    setCurrentTeam(team.name);
    setActiveCage(team.ballCage);
  };

  const handleAnimationComplete = () => {
    if (currentTeam === null) return;

    const teamId = currentDrawOrder[currentDrawIndex];
    const team = config.ballCages.flat().find((t) => t.id === teamId);

    if (!team) return;

    const rowIndex = team.ballCage - 1;
    const availableZones = zones.filter(
      (zone) => zone.teams[rowIndex] === null
    );

    if (availableZones.length > 0) {
      const nextZone = availableZones[0];
      const updatedZones = zones.map((zone) => {
        if (zone.id === nextZone.id) {
          const updatedTeams = [...zone.teams];
          updatedTeams[rowIndex] = currentTeam;
          return { ...zone, teams: updatedTeams };
        }
        return zone;
      });

      setZones(updatedZones);
    }

    setTimeout(() => {
      setActiveCage(null);
      setCurrentTeam(null);
      const nextIndex = currentDrawIndex + 1;
      setCurrentDrawIndex(nextIndex);
      processNextDraw(nextIndex);
    }, 1500);
  };

  const handleReset = () => {
    initializeZones(config.numZones);
    setCurrentDrawIndex(0);
    setIsDrawing(false);
    setActiveCage(null);
    setCurrentTeam(null);
  };

  const handleTitleClick = useCallback(() => {
    setOptionVisible((prev) => !prev);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title" onClick={handleTitleClick}>
          Sorteo de equipos "Torneo Sarmientito 2025"
        </h1>
        <div className="category-selector">
          <label htmlFor="category">Categoría:</label>
          <select
            id="category"
            value={currentCategory}
            onChange={(e) => handleCategoryChange(parseInt(e.target.value))}
            disabled={isDrawing}
          >
            {categoryConfigs.map((cat) => (
              <option
                key={cat.year}
                value={
                  cat.year === 15
                    ? "SUB-15"
                    : cat.year === 12
                    ? "SUB-12"
                    : String(cat.year)
                }
              >
                {cat.year === 15
                  ? "SUB-15"
                  : cat.year === 12
                  ? "SUB-12"
                  : cat.year}
              </option>
            ))}
          </select>
          <button
            onClick={handleStartDraw}
            disabled={
              isDrawing ||
              (config.drawMode === "manual" && config.drawOrder.length === 0) ||
              config.ballCages.flat().length === 0
            }
            className="category-play-button"
            title="Iniciar Sorteo"
          >
            <Play size={20} />
          </button>
          <button
            onClick={handleReset}
            disabled={!isDrawing}
            className="category-stop-button"
            title="Detener Sorteo"
          >
            <Square size={20} />
          </button>
          <button
            onClick={() => setShowGroups(!showGroups)}
            disabled={isDrawing}
            className="category-groups-button"
            title="Mostrar Grupos"
          >
            <Users size={20} />
          </button>
        </div>
      </header>

      <main className="app-main">
        <ZoneGrid zones={zones} />
        <div className="ball-cages-container">
          {[1, 2, 3, 4].map((cageNum) => (
            <BallCage
              key={cageNum}
              cageNumber={cageNum}
              isActive={activeCage === cageNum}
              currentTeam={activeCage === cageNum ? currentTeam : null}
              onAnimationComplete={handleAnimationComplete}
              backgroundImage={BACKGROUND_BALL_IMAGE}
            />
          ))}
        </div>
      </main>

      {optionVisible && (
        <>
          <CategoryConfigPanel
            categories={categoryConfigs}
            onCategoriesChange={handleCategoryConfigsChange}
            isDrawing={isDrawing}
          />

          <ControlPanel
            config={config}
            onConfigChange={handleConfigChange}
            onStartDraw={handleStartDraw}
            onReset={handleReset}
            isDrawing={isDrawing}
          />
        </>
      )}

      {showGroups && (
        <div onClick={() => setShowGroups(false)}>
          <GroupsDisplay config={config} />
        </div>
      )}
    </div>
  );
}

export default App;
