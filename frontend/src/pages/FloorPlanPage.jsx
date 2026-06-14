import React, { useState } from "react";
import { Plus, Edit2, Trash2, MapPin, Grid, HelpCircle, SwitchCamera } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { Dialog } from "../components/ui/Dialog";
import { Switch } from "../components/ui/Switch";

export const FloorPlanPage = () => {
  const {
    floors,
    tables,
    addFloor,
    deleteFloor,
    addTable,
    updateTable,
    deleteTable,
    toggleTableActive,
    fetchFloors,
    fetchTables,
  } = useAdmin();

  const [selectedFloorId, setSelectedFloorId] = useState("");

  // Floors form dialog
  const [floorModalOpen, setFloorModalOpen] = useState(false);
  const [floorNameInput, setFloorNameInput] = useState("");
  const [floorError, setFloorError] = useState("");

  // Tables edit dialog
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [isEditTable, setIsEditTable] = useState(false);
  const [tableTargetId, setTableTargetId] = useState(null);
  const [tableNumInput, setTableNumInput] = useState("");
  const [tableSeatsInput, setTableSeatsInput] = useState("4");
  const [tableActiveToggle, setTableActiveToggle] = useState(true);
  const [tableError, setTableError] = useState("");

  // Table delete target
  const [deleteTableId, setDeleteTableId] = useState(null);

  // Fetch floors and tables on mount
  React.useEffect(() => {
    fetchFloors().catch(console.error);
    fetchTables().catch(console.error);
  }, []);

  // Auto select first floor when loaded
  React.useEffect(() => {
    if (floors.length > 0 && !selectedFloorId) {
      setSelectedFloorId(floors[0].id);
    }
  }, [floors, selectedFloorId]);

  // Selected floor's tables list
  const activeTables = tables.filter((t) => t.floorId?.toString() === selectedFloorId?.toString());

  // Floor submission
  const handleFloorSubmit = async (e) => {
    e.preventDefault();
    setFloorError("");
    if (!floorNameInput.trim()) {
      setFloorError("Floor name is required.");
      return;
    }
    const exists = floors.some(
      (f) => f.name.toLowerCase() === floorNameInput.trim().toLowerCase()
    );
    if (exists) {
      setFloorError("Floor name already exists.");
      return;
    }

    try {
      const created = await addFloor(floorNameInput.trim());
      setSelectedFloorId(created.id);
      setFloorNameInput("");
      setFloorModalOpen(false);
    } catch (err) {
      setFloorError(err.message || "Failed to create floor.");
    }
  };

  // Floor deletion
  const handleFloorDelete = async (floorId) => {
    if (floors.length <= 1) {
      alert("At least one floor configuration must remain in the system.");
      return;
    }
    if (confirm("Are you sure? Deleting this floor will permanently remove all tables configured under it.")) {
      try {
        await deleteFloor(floorId);
        // Fallback selection
        const remaining = floors.filter((f) => f.id.toString() !== floorId.toString());
        if (remaining.length > 0) {
          setSelectedFloorId(remaining[0].id);
        } else {
          setSelectedFloorId("");
        }
      } catch (err) {
        alert(err.message || "Failed to delete floor.");
      }
    }
  };

  // Table Add/Edit open
  const openTableModal = (tableObj = null) => {
    setTableError("");
    if (tableObj) {
      // Edit
      setIsEditTable(true);
      setTableTargetId(tableObj.id);
      setTableNumInput(tableObj.tableNumber);
      setTableSeatsInput(tableObj.seats.toString());
      setTableActiveToggle(tableObj.isActive);
    } else {
      // Create
      setIsEditTable(false);
      setTableTargetId(null);
      // Auto generate next table number
      const nextNum = activeTables.length + 1;
      setTableNumInput(`T-${nextNum < 10 ? "0" + nextNum : nextNum}`);
      setTableSeatsInput("4");
      setTableActiveToggle(true);
    }
    setTableModalOpen(true);
  };

  // Table Add/Edit submit
  const handleTableSubmit = async (e) => {
    e.preventDefault();
    setTableError("");

    if (!tableNumInput.trim()) {
      setTableError("Table number/identifier is required.");
      return;
    }

    const seats = parseInt(tableSeatsInput);
    if (isNaN(seats) || seats <= 0) {
      setTableError("Please enter a valid seat count.");
      return;
    }

    // Check unique table number on the same floor
    const isDuplicate = activeTables.some(
      (t) => t.tableNumber.toLowerCase() === tableNumInput.trim().toLowerCase() && t.id.toString() !== tableTargetId?.toString()
    );
    if (isDuplicate) {
      setTableError("A table with this number already exists on this floor.");
      return;
    }

    const data = {
      tableNumber: tableNumInput.trim().toUpperCase(),
      seats: seats,
      isActive: tableActiveToggle,
      floorId: selectedFloorId,
    };

    try {
      if (isEditTable) {
        await updateTable(tableTargetId, data);
      } else {
        await addTable(data);
      }
      setTableModalOpen(false);
    } catch (err) {
      setTableError(err.message || "Failed to save table.");
    }
  };

  // Table delete confirm
  const handleTableDeleteConfirm = async () => {
    if (deleteTableId) {
      try {
        await deleteTable(deleteTableId);
        setDeleteTableId(null);
      } catch (err) {
        alert(err.message || "Failed to delete table.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-sora font-bold text-text-primary">
            Floor Plan & Table Setup
          </h1>
          <p className="text-sm text-text-secondary">
            Manage floor levels and configure restaurant table seating diagrams.
          </p>
        </div>
        <button
          onClick={() => setFloorModalOpen(true)}
          className="inline-flex items-center gap-2 h-10 px-4 bg-accent hover:bg-amber-500 text-bg font-sora font-bold text-sm rounded-lg transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Floor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Floors Checklist */}
        <div className="lg:col-span-1 bg-surface border border-border p-4 rounded-xl space-y-4 shadow-card h-fit">
          <h2 className="text-sm font-sora font-bold text-text-secondary uppercase tracking-wider">
            Floors / Levels
          </h2>
          <div className="space-y-2">
            {floors.map((fl) => (
              <div
                key={fl.id}
                className={`flex items-center justify-between p-3 rounded-lg border text-sm font-medium transition-all group cursor-pointer ${
                  selectedFloorId === fl.id
                    ? "bg-accent-dim text-accent border-accent/40"
                    : "bg-surface-raised border-border/60 text-text-secondary hover:text-text-primary hover:border-border"
                }`}
                onClick={() => setSelectedFloorId(fl.id)}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{fl.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFloorDelete(fl.id);
                  }}
                  className="text-text-secondary hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface"
                  title="Delete Floor"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Tables Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-sora font-bold text-text-primary flex items-center gap-2">
              <Grid size={20} className="text-accent" />
              <span>
                {floors.find((f) => f.id === selectedFloorId)?.name || "Tables Setup"}
              </span>
            </h2>
            {selectedFloorId && (
              <button
                onClick={() => openTableModal(null)}
                className="inline-flex items-center gap-1.5 h-9 px-3 bg-surface-raised hover:bg-surface border border-border text-xs font-semibold rounded-lg text-text-primary transition-all"
              >
                <Plus size={14} />
                <span>Add Table</span>
              </button>
            )}
          </div>

          {activeTables.length === 0 ? (
            <div className="bg-surface border border-border p-12 rounded-xl text-center shadow-card">
              <p className="text-sm text-text-secondary mb-3">
                No tables configured for this level yet.
              </p>
              <button
                onClick={() => openTableModal(null)}
                className="h-9 px-4 bg-accent hover:bg-amber-500 text-bg text-xs font-bold rounded-lg transition-all"
              >
                Configure First Table
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {activeTables.map((t) => (
                <div
                  key={t.id}
                  className={`bg-surface border p-4 rounded-xl shadow-card relative flex flex-col justify-between h-36 transition-all ${
                    t.isActive ? "border-border" : "border-border/40 opacity-60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-sora font-bold text-lg text-text-primary">
                        {t.tableNumber}
                      </span>
                      {t.isActive ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-accent-dim text-accent border border-accent/20">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-border text-text-secondary">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {t.seats} Seating Seats
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/40 pt-3">
                    {/* Active toggle */}
                    <button
                      onClick={() => toggleTableActive(t.id)}
                      className="text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1"
                      title={t.isActive ? "Deactivate" : "Activate"}
                    >
                      <Switch checked={t.isActive} onChange={() => toggleTableActive(t.id)} />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openTableModal(t)}
                        className="p-1 text-text-secondary hover:text-accent hover:bg-surface-raised rounded transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTableId(t.id)}
                        className="p-1 text-text-secondary hover:text-danger hover:bg-surface-raised rounded transition-colors"
                        title="Delete Table"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floor Creation Modal */}
      <Dialog
        isOpen={floorModalOpen}
        onClose={() => setFloorModalOpen(false)}
        title="Add Business Floor"
      >
        <form onSubmit={floorFloorSubmit => handleFloorSubmit(floorFloorSubmit)} className="space-y-4">
          {floorError && (
            <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm font-medium">
              {floorError}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Floor / Area Name
            </label>
            <input
              type="text"
              value={floorNameInput}
              onChange={(e) => setFloorNameInput(e.target.value)}
              placeholder="e.g. Terrace Section"
              className="w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setFloorModalOpen(false)}
              className="h-10 px-4 border border-border text-text-primary rounded-lg text-sm font-semibold hover:bg-surface-raised transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-4 bg-accent hover:bg-amber-500 text-bg font-sora font-semibold rounded-lg transition-all"
            >
              Add Floor
            </button>
          </div>
        </form>
      </Dialog>

      {/* Table CRUD Modal */}
      <Dialog
        isOpen={tableModalOpen}
        onClose={() => setTableModalOpen(false)}
        title={isEditTable ? "Edit Table Parameters" : "Add Table Setup"}
      >
        <form onSubmit={handleTableSubmit} className="space-y-4">
          {tableError && (
            <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm font-medium">
              {tableError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Table Identifier / Number
            </label>
            <input
              type="text"
              value={tableNumInput}
              onChange={(e) => setTableNumInput(e.target.value)}
              placeholder="e.g. T-10"
              className="w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Seating Capacity (Seats)
            </label>
            <input
              type="number"
              value={tableSeatsInput}
              onChange={(e) => setTableSeatsInput(e.target.value)}
              placeholder="e.g. 4"
              className="w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-surface-raised/50 border border-border rounded-lg">
            <div>
              <p className="text-sm font-semibold text-text-primary">Enable Table</p>
              <p className="text-xs text-text-secondary">Shows inside cashier table selection screen.</p>
            </div>
            <Switch
              checked={tableActiveToggle}
              onChange={(val) => setTableActiveToggle(val)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setTableModalOpen(false)}
              className="h-10 px-4 border border-border text-text-primary rounded-lg text-sm font-semibold hover:bg-surface-raised transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-4 bg-accent hover:bg-amber-500 text-bg font-sora font-semibold rounded-lg transition-all"
            >
              Save Table
            </button>
          </div>
        </form>
      </Dialog>

      {/* Table Delete Dialog */}
      <Dialog
        isOpen={deleteTableId !== null}
        onClose={() => setDeleteTableId(null)}
        title="Delete Table"
        className="max-w-sm"
      >
        <div className="flex flex-col items-center text-center p-2">
          <div className="h-12 w-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mb-4">
            <HelpCircle size={24} />
          </div>
          <p className="text-sm text-text-primary font-medium mb-1">
            Are you sure you want to delete this table?
          </p>
          <p className="text-xs text-text-secondary mb-6">
            This table will be permanently removed from all floor diagrams and terminal screens.
          </p>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => setDeleteTableId(null)}
              className="flex-1 h-10 border border-border text-text-primary rounded-lg text-sm font-semibold hover:bg-surface-raised transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleTableDeleteConfirm}
              className="flex-1 h-10 bg-danger text-text-primary rounded-lg text-sm font-semibold hover:bg-red-600 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
