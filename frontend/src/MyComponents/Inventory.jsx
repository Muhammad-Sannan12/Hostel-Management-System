import MainLayout from "@/components/layout/MainLayout";
import React, { useContext, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import {
  LayoutGrid,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { Package, Plus } from "lucide-react";
const initialState = {
  // item_name: '',
  supplier: "",
  unit: "",
  location: "",
  unitPrice: "",
  quantity: "",
  discount: "",
  category: "",
  description: "",
  condition: "",
  itemType: "",
  messSubCategory: "",
  messItem: "",
  purchase_date: "",
};
import { useHostel } from "@/context/useHostel";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Inventory = () => {
  const {
    addInventoryItem,
    getFilteredInventory,
    inventoryItems,
    updateInventory,
    deleteInventory,
  } = useHostel();
  // console.log("Inventory Items in Inventory Page",inventoryItems)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingInventory, setEditingInventory] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const [filterCategory, setFilterCategory] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [filterLoading, setFilterLoading] = useState(false);
  const [selectCategory, setSelectCategory] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    flip: false,
  });
  const [openMenuId, setOpenMenuId] = useState(null);

  const [viewingInventory, setViewingInventory] = useState(null);

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  // // useEffect(() => {
  // //   setFilteredItems(inventoryItems);
  // // }, [inventoryItems]);
  const handleView = (inventoryItem) => {
    setViewingInventory(inventoryItem);
    setIsViewDialogOpen(true);
  };
  const handleMenuClick = (e, studentId) => {
    e.stopPropagation();

    if (openMenuId === studentId) {
      setOpenMenuId(null);
      return;
    }

    const buttonRect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 140; // Approximate height of dropdown
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    // Determine if we should flip the dropdown upward
    const shouldFlip = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    setMenuPosition({
      top: shouldFlip ? buttonRect.top - dropdownHeight : buttonRect.bottom + 4,
      left: buttonRect.right - 130, // Align right edge of dropdown with button
      flip: shouldFlip,
    });

    setOpenMenuId(studentId);
  };
  const handleEdit = (inventoryItem) => {
    //   console.log("Original inventoryItem data:", inventoryItem);
    setEditingInventory(inventoryItem);
    // setIsSubmitting(false);
    setFormData({
      supplier: inventoryItem.supplier,
      unit: inventoryItem.unit,
      location: inventoryItem.location,
      unitPrice: inventoryItem.unitPrice,
      quantity: inventoryItem.quantity,
      discount: inventoryItem.discount,
      category: inventoryItem.category,
      description: inventoryItem.description,
      condition: inventoryItem.condition,
      itemType: inventoryItem.itemType,
      messSubCategory: inventoryItem.messSubCategory,
      messItem: inventoryItem.messItem,
      purchase_date: inventoryItem.purchase_date.slice(0, 10),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!validateForm()) return;
      console.log("submitting:", formData);

      setIsSubmitting(true);
      let result;
      if (editingInventory) {
        const ItemId = editingInventory._id;
        console.log("Updating student with ID:", ItemId);
        result = await updateInventory(ItemId, formData);
        if (result?.success) toast.success("Inventory updated successfully");
      } else {
        result = await addInventoryItem(formData);
        if (result?.success) {
          setIsDialogOpen(false);
          setEditingInventory(null);
          setFormData(initialState);
          toast.success("Inventory added successfully");
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("An unexpected error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const cleanedData = cleanObject(formData)
  const handleDelete = async (inventoryId) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this inventory item?",
      );
      if (!confirmed) return;

      const result = await deleteInventory(inventoryId);

      if (result?.success) {
        setFilteredItems((prev) =>
          prev.filter((item) => item._id !== inventoryId),
        );
        toast.success("Inventory item deleted successfully");
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast.error("An unexpected error occurred while deleting");
    }
  };
  const validateForm = () => {
    const newErrors = {};

    // // Item Name
    // if (!formData.item_name?.trim()) {
    //   newErrors.item_name = "Item name is required";
    // }
    //  else if (formData.item_name.trim().length < 2) {
    //   newErrors.item_name = "Item name must be at least 2 characters";
    // }

    // Supplier Name
    if (!formData.supplier?.trim()) {
      newErrors.supplier = "Supplier name is required";
    } else if (formData.supplier.trim().length < 2) {
      newErrors.supplier = "Supplier name must be at least 2 characters";
    }

    // Quantity
    if (!formData.quantity && formData.quantity !== 0) {
      newErrors.quantity = "Quantity is required";
    } else if (Number(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    } else if (!Number.isInteger(Number(formData.quantity))) {
      newErrors.quantity = "Quantity must be a whole number";
    }

    // Location
    if (!formData.location?.trim()) {
      newErrors.location = "Location is required";
    } else if (formData.location.trim().length < 2) {
      newErrors.location = "Location must be at least 2 characters";
    }

    // Unit Price
    if (!formData.unitPrice && formData.unitPrice !== 0) {
      newErrors.unitPrice = "Unit price is required";
    } else if (Number(formData.unitPrice) < 0) {
      newErrors.unitPrice = "Unit price cannot be negative";
    }

    // Category
    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    // Condition
    if (!formData.condition && formData.messSubCategory !== "dry_grocery") {
      newErrors.condition = "Please select a condition";
    }
    if (!formData.purchase_date) {
      newErrors.purchase_date = "Purchase date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const fetchFilteredInventory = async (category, date) => {
    // Must have at least one filter
    if (!category && !date) {
      setFilteredItems(inventoryItems); // show all if both cleared
      return;
    }
    setSelectCategory(true);
    setFilterLoading(true);
    try {
      const result = await getFilteredInventory(category, date);
      console.log("inventoryjsx:", result.data);
      setFilteredItems(result.data);
    } catch (err) {
      console.error("Filter fetch failed", err);
    } finally {
      setFilterLoading(false);
    }
  };
  const handleFilterCategory = (value) => {
    setFilterCategory(value);
    fetchFilteredInventory(value, filterDate);
  };

  const handleFilterDate = (e) => {
    const date = e.target.value;
    setFilterDate(date);
    fetchFilteredInventory(filterCategory, date);
  };

  const clearFilters = () => {
    setFilterCategory("");
    setFilterDate("");
    setSelectCategory(false);
    // setFilteredItems(inventoryItems);
  };
  return (
    <MainLayout>
      <div className="mb-8 animate-fade-in flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Inventory Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track and manage your inventory
          </p>
        </div>
        <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DrawerTrigger asChild>
            <Button
              onClick={() => {
                setEditingInventory(null);
                setFormData({
                  supplier: "",
                  unit: "",
                  location: "",
                  unitPrice: "",
                  quantity: "",
                  discount: "",
                  category: "",
                  description: "",
                  condition: "",
                  itemType: "",
                  messSubCategory: "",
                  messItem: "",
                  purchase_date: "",
                });
                setErrors({});
              }}
              style={{
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 400,
                padding: "6px 14px",
                height: "34px",
                flexShrink: 0,
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle style={{ fontSize: "18px", fontWeight: 600 }}>
                Add Inventory Item
              </DrawerTitle>
            </DrawerHeader>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <style>
                {`
                                      .admission-form label {
                                        font-size: 13px;
                                        font-weight: 500;
                                      }
                                      .admission-form input,
                                      .admission-form input::placeholder {
                                        font-size: 13px;
                                        font-weight: 400;
                                        height: 36px;
                                        padding: 6px 10px;
                                        border-radius: 4px;
                                      }
                                      .admission-form button[type="button"] > div {
                                        font-size: 13px;
                                        font-weight: 400;
                                        height: 36px;
                                        padding: 6px 10px;
                                        border-radius: 4px;
                                      }
                                      .admission-form .error-text {
                                        font-size: 12px;
                                      }
                                    `}
              </style>
              <div className="admission-form grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                <div>
                  <Label
                    htmlFor="supplier"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Supplier Name
                  </Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier: e.target.value })
                    }
                    placeholder="Enter supplier name"
                    className={errors.supplier ? "border-destructive" : ""}
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      height: "36px",
                      padding: "6px 10px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.supplier && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.supplier}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="location"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Enter Supplier's location"
                    className={errors.location ? "border-destructive" : ""}
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      height: "36px",
                      padding: "6px 10px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.location && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Category Dropdown */}
                <div>
                  <Label
                    htmlFor="category"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        category: value,
                        itemType: "",
                        messSubCategory: "",
                        messItem: "",
                      })
                    }
                  >
                    <SelectTrigger
                      className={errors.category ? "border-destructive" : ""}
                      style={{
                        fontSize: "13px",
                        fontWeight: 400,
                        height: "36px",
                        padding: "6px 10px",
                        borderRadius: "4px",
                      }}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="mess_inventory">
                        Mess Inventory
                      </SelectItem>
                      <SelectItem value="miscellaneous">
                        Miscellaneous
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Furniture Items Dropdown */}
                {formData.category === "furniture" && (
                  <div>
                    <Label
                      htmlFor="itemType"
                      style={{ fontSize: "13px", fontWeight: 500 }}
                    >
                      Furniture Item
                    </Label>
                    <Select
                      value={formData.itemType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, itemType: value })
                      }
                    >
                      <SelectTrigger
                        className={errors.itemType ? "border-destructive" : ""}
                        style={{
                          fontSize: "13px",
                          fontWeight: 400,
                          height: "36px",
                          padding: "6px 10px",
                          borderRadius: "4px",
                        }}
                      >
                        <SelectValue placeholder="Select furniture item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bed">Bed</SelectItem>
                        <SelectItem value="chair">Chair</SelectItem>
                        <SelectItem value="mattress">Mattress</SelectItem>
                        <SelectItem value="study_desk">Study Desk</SelectItem>
                        <SelectItem value="wardrobe">
                          Wardrobe/Closet
                        </SelectItem>
                        <SelectItem value="coffee_table">
                          Coffee Table
                        </SelectItem>
                        <SelectItem value="shoe_rack">Shoe Rack</SelectItem>
                        <SelectItem value="book_shelf">Book Shelf</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.itemType && (
                      <p
                        className="mt-1 error-text text-destructive"
                        style={{ fontSize: "12px" }}
                      >
                        {errors.itemType}
                      </p>
                    )}
                  </div>
                )}

                {/* Electronics Items Dropdown */}
                {formData.category === "electronics" && (
                  <div>
                    <Label
                      htmlFor="itemType"
                      style={{ fontSize: "13px", fontWeight: 500 }}
                    >
                      Electronics Item
                    </Label>
                    <Select
                      value={formData.itemType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, itemType: value })
                      }
                    >
                      <SelectTrigger
                        className={errors.itemType ? "border-destructive" : ""}
                        style={{
                          fontSize: "13px",
                          fontWeight: 400,
                          height: "36px",
                          padding: "6px 10px",
                          borderRadius: "4px",
                        }}
                      >
                        <SelectValue placeholder="Select electronics item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bulbs">Bulbs</SelectItem>
                        <SelectItem value="fan">Fan</SelectItem>
                        <SelectItem value="switches">Switches</SelectItem>
                        <SelectItem value="switchboards">
                          Switchboards
                        </SelectItem>
                        <SelectItem value="electric_wiring">
                          Electric Wiring
                        </SelectItem>
                        <SelectItem value="electric_water_heater">
                          Electric Water Heater
                        </SelectItem>
                        <SelectItem value="cctv_camera">CCTV Camera</SelectItem>
                        <SelectItem value="refrigerator">
                          Refrigerator
                        </SelectItem>
                        <SelectItem value="washing_machine">
                          Washing Machine
                        </SelectItem>
                        <SelectItem value="microwave_oven">
                          Microwave Oven
                        </SelectItem>
                        <SelectItem value="ups_inverter">
                          UPS/Inverter
                        </SelectItem>
                        <SelectItem value="air_conditioner">
                          Air Conditioner (AC)
                        </SelectItem>
                        <SelectItem value="tv">TV</SelectItem>
                        <SelectItem value="wifi_router">WiFi Router</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.itemType && (
                      <p
                        className="mt-1 error-text text-destructive"
                        style={{ fontSize: "12px" }}
                      >
                        {errors.itemType}
                      </p>
                    )}
                  </div>
                )}

                {/* Mess Inventory - Sub Category Dropdown */}
                {formData.category === "mess_inventory" && (
                  <div>
                    <Label
                      htmlFor="messSubCategory"
                      style={{ fontSize: "13px", fontWeight: 500 }}
                    >
                      Mess Sub-Category
                    </Label>
                    <Select
                      value={formData.messSubCategory}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          messSubCategory: value,
                          messItem: "",
                        })
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.messSubCategory ? "border-destructive" : ""
                        }
                        style={{
                          fontSize: "13px",
                          fontWeight: 400,
                          height: "36px",
                          padding: "6px 10px",
                          borderRadius: "4px",
                        }}
                      >
                        <SelectValue placeholder="Select sub-category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kitchen_equipment">
                          Kitchen Equipment
                        </SelectItem>
                        <SelectItem value="serving_dining">
                          Serving & Dining Items
                        </SelectItem>
                        <SelectItem value="cooking_tools">
                          Cooking Tools & Utensils
                        </SelectItem>
                        <SelectItem value="dry_grocery">
                          Dry Grocery & Staples
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.messSubCategory && (
                      <p
                        className="mt-1 error-text text-destructive"
                        style={{ fontSize: "12px" }}
                      >
                        {errors.messSubCategory}
                      </p>
                    )}
                  </div>
                )}

                {/* Kitchen Equipment Items */}
                {formData.category === "mess_inventory" &&
                  formData.messSubCategory === "kitchen_equipment" && (
                    <div>
                      <Label
                        htmlFor="messItem"
                        style={{ fontSize: "13px", fontWeight: 500 }}
                      >
                        Kitchen Equipment Item
                      </Label>
                      <Select
                        value={formData.messItem}
                        onValueChange={(value) =>
                          setFormData({ ...formData, messItem: value })
                        }
                      >
                        <SelectTrigger
                          className={
                            errors.messItem ? "border-destructive" : ""
                          }
                          style={{
                            fontSize: "13px",
                            fontWeight: 400,
                            height: "36px",
                            padding: "6px 10px",
                            borderRadius: "4px",
                          }}
                        >
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gas_stove">
                            Gas Stove/Burner
                          </SelectItem>
                          <SelectItem value="cooking_pots_pans">
                            Cooking Pots & Pans
                          </SelectItem>
                          <SelectItem value="pressure_cooker">
                            Pressure Cooker
                          </SelectItem>
                          <SelectItem value="frying_pan">
                            Frying Pan (Karahi)
                          </SelectItem>
                          <SelectItem value="tawa">Tawa</SelectItem>
                          <SelectItem value="chimney_exhaust">
                            Chimney/Exhaust Hood
                          </SelectItem>
                          <SelectItem value="gas_cylinder">
                            Gas Cylinder & Regulator
                          </SelectItem>
                          <SelectItem value="refrigerator">
                            Refrigerator
                          </SelectItem>
                          <SelectItem value="microwave_oven">
                            Microwave Oven
                          </SelectItem>
                          <SelectItem value="electric_kettle">
                            Electric Kettle
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.messItem && (
                        <p
                          className="mt-1 error-text text-destructive"
                          style={{ fontSize: "12px" }}
                        >
                          {errors.messItem}
                        </p>
                      )}
                    </div>
                  )}

                {/* Serving & Dining Items */}
                {formData.category === "mess_inventory" &&
                  formData.messSubCategory === "serving_dining" && (
                    <div>
                      <Label
                        htmlFor="messItem"
                        style={{ fontSize: "13px", fontWeight: 500 }}
                      >
                        Serving & Dining Item
                      </Label>
                      <Select
                        value={formData.messItem}
                        onValueChange={(value) =>
                          setFormData({ ...formData, messItem: value })
                        }
                      >
                        <SelectTrigger
                          className={
                            errors.messItem ? "border-destructive" : ""
                          }
                          style={{
                            fontSize: "13px",
                            fontWeight: 400,
                            height: "36px",
                            padding: "6px 10px",
                            borderRadius: "4px",
                          }}
                        >
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plates">Plates (Thaal)</SelectItem>
                          <SelectItem value="bowls">Bowls</SelectItem>
                          <SelectItem value="glasses">Glasses</SelectItem>
                          <SelectItem value="cups_saucers">
                            Cups & Saucers
                          </SelectItem>
                          <SelectItem value="serving_spoons">
                            Serving Spoons
                          </SelectItem>
                          <SelectItem value="tray">Tray</SelectItem>
                          <SelectItem value="dining_table_benches">
                            Dining Table & Benches
                          </SelectItem>
                          <SelectItem value="table_cloth">
                            Table Cloth
                          </SelectItem>
                          <SelectItem value="tissue_napkin_holder">
                            Tissue/Napkin Holder
                          </SelectItem>
                          <SelectItem value="water_jug_dispenser">
                            Water Jug & Dispenser
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.messItem && (
                        <p
                          className="mt-1 error-text text-destructive"
                          style={{ fontSize: "12px" }}
                        >
                          {errors.messItem}
                        </p>
                      )}
                    </div>
                  )}

                {/* Cooking Tools & Utensils Items */}
                {formData.category === "mess_inventory" &&
                  formData.messSubCategory === "cooking_tools" && (
                    <div>
                      <Label
                        htmlFor="messItem"
                        style={{ fontSize: "13px", fontWeight: 500 }}
                      >
                        Cooking Tool / Utensil
                      </Label>
                      <Select
                        value={formData.messItem}
                        onValueChange={(value) =>
                          setFormData({ ...formData, messItem: value })
                        }
                      >
                        <SelectTrigger
                          className={
                            errors.messItem ? "border-destructive" : ""
                          }
                          style={{
                            fontSize: "13px",
                            fontWeight: 400,
                            height: "36px",
                            padding: "6px 10px",
                            borderRadius: "4px",
                          }}
                        >
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kitchen_knives">
                            Kitchen Knives
                          </SelectItem>
                          <SelectItem value="chopping_board">
                            Chopping Board
                          </SelectItem>
                          <SelectItem value="ladle">Ladle (Karchi)</SelectItem>
                          <SelectItem value="spatula">Spatula</SelectItem>
                          <SelectItem value="strainer_colander">
                            Strainer/Colander
                          </SelectItem>
                          <SelectItem value="grater">Grater</SelectItem>
                          <SelectItem value="peeler">Peeler</SelectItem>
                          <SelectItem value="measuring_cups_spoons">
                            Measuring Cups & Spoons
                          </SelectItem>
                          <SelectItem value="mixing_bowls">
                            Mixing Bowls
                          </SelectItem>
                          <SelectItem value="rolling_pin">
                            Rolling Pin (Belan)
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.messItem && (
                        <p
                          className="mt-1 error-text text-destructive"
                          style={{ fontSize: "12px" }}
                        >
                          {errors.messItem}
                        </p>
                      )}
                    </div>
                  )}

                {/* Dry Grocery & Staples Items */}
                {formData.category === "mess_inventory" &&
                  formData.messSubCategory === "dry_grocery" && (
                    <>
                      <div>
                        <Label
                          htmlFor="messItem"
                          style={{ fontSize: "13px", fontWeight: 500 }}
                        >
                          Dry Grocery / Staple Item
                        </Label>
                        <Select
                          value={formData.messItem}
                          onValueChange={(value) =>
                            setFormData({ ...formData, messItem: value })
                          }
                        >
                          <SelectTrigger
                            className={
                              errors.messItem ? "border-destructive" : ""
                            }
                            style={{
                              fontSize: "13px",
                              fontWeight: 400,
                              height: "36px",
                              padding: "6px 10px",
                              borderRadius: "4px",
                            }}
                          >
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rice">Rice (Chawal)</SelectItem>
                            <SelectItem value="flour">Flour (Atta)</SelectItem>
                            <SelectItem value="lentils">
                              Lentils (Daal)
                            </SelectItem>
                            <SelectItem value="cooking_oil">
                              Cooking Oil
                            </SelectItem>
                            <SelectItem value="salt_spices_masala">
                              Salt, Spices & Masala
                            </SelectItem>
                            <SelectItem value="vegetables">
                              Vegetables
                            </SelectItem>
                            <SelectItem value="tea_sugar">
                              Tea & Sugar
                            </SelectItem>
                            <SelectItem value="milk">Milk</SelectItem>
                            <SelectItem value="bread">Bread</SelectItem>
                            <SelectItem value="eggs">Eggs</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.messItem && (
                          <p
                            className="mt-1 error-text text-destructive"
                            style={{ fontSize: "12px" }}
                          >
                            {errors.messItem}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="unit"
                          style={{ fontSize: "13px", fontWeight: 500 }}
                        >
                          Unit
                        </Label>
                        <Select
                          value={formData.unit}
                          onValueChange={(value) =>
                            setFormData({ ...formData, unit: value })
                          }
                        >
                          <SelectTrigger
                            style={{
                              fontSize: "13px",
                              height: "36px",
                              padding: "6px 10px",
                              borderRadius: "4px",
                            }}
                          >
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="litre">Litre (L)</SelectItem>
                            <SelectItem value="gallon">Gallon (gal)</SelectItem>
                            <SelectItem value="kg">Kilogram (kg)</SelectItem>
                            <SelectItem value="g">Gram (g)</SelectItem>
                            <SelectItem value="dozen">
                              Dozen (12 pcs)
                            </SelectItem>
                            <SelectItem value="pcs">Piece (pcs)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                {formData.messSubCategory !== "dry_grocery" && (
                  <div>
                    <Label
                      htmlFor="condition"
                      style={{ fontSize: "13px", fontWeight: 500 }}
                    >
                      Condition
                    </Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) =>
                        setFormData({ ...formData, condition: value })
                      }
                    >
                      <SelectTrigger
                        className={errors.condition ? "border-destructive" : ""}
                        style={{
                          fontSize: "13px",
                          fontWeight: 400,
                          height: "36px",
                          padding: "6px 10px",
                          borderRadius: "4px",
                        }}
                      >
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                        <SelectItem value="needs_repair">
                          Needs Repair
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.condition && (
                      <p
                        className="mt-1 error-text text-destructive"
                        style={{ fontSize: "12px" }}
                      >
                        {errors.condition}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <Label
                    htmlFor="quantity"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    value={formData.quantity}
                    type="number"
                    placeholder="Enter quantity"
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className={errors.quantity ? "border-destructive" : ""}
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      height: "36px",
                      padding: "6px 10px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.quantity && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.quantity}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="unitPrice"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Unit Price
                  </Label>
                  <Input
                    id="unitPrice"
                    value={formData.unitPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || Number(value) >= 0) {
                        setFormData({ ...formData, unitPrice: value });
                      }
                    }}
                    type="number"
                    min="0"
                    placeholder="Enter item unit price"
                    className={errors.unitPrice ? "border-destructive" : ""}
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      height: "36px",
                      padding: "6px 10px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.unitPrice && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.unitPrice}
                    </p>
                  )}
                </div>
                {/* Discount (Optional) */}
                <div>
                  <Label
                    htmlFor="discount"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Discount{" "}
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 400,
                        color: "#888",
                      }}
                    >
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="discount"
                    value={formData.discount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || Number(value) >= 0) {
                        setFormData({ ...formData, discount: value });
                      }
                    }}
                    type="number"
                    min="0"
                    placeholder="Enter discount amount"
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      height: "36px",
                      padding: "6px 10px",
                      borderRadius: "4px",
                    }}
                  />
                </div>

                {/* Total Price (Read-only, auto-calculated) */}
                <div>
                  <Label
                    htmlFor="totalPrice"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Total Price
                  </Label>
                  <Input
                    id="totalPrice"
                    value={
                      formData.quantity !== "" && formData.unitPrice !== ""
                        ? Math.max(
                            0,
                            Number(formData.quantity) *
                              Number(formData.unitPrice) -
                              Number(formData.discount || 0),
                          ).toFixed(2)
                        : ""
                    }
                    readOnly
                    placeholder="Auto-calculated"
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      height: "36px",
                      padding: "6px 10px",
                      borderRadius: "4px",
                      backgroundColor: "#f5f5f5",
                      cursor: "not-allowed",
                      color: "#555",
                    }}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="purchase_date"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Purchase Date
                  </Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchase_date: e.target.value,
                      })
                    }
                    className={errors.purchase_date ? "border-destructive" : ""}
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      height: "36px",
                      padding: "6px 10px",
                      borderRadius: "4px",
                    }}
                  />
                  {errors.purchase_date && (
                    <p
                      className="mt-1 error-text text-destructive"
                      style={{ fontSize: "12px" }}
                    >
                      {errors.purchase_date}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="description"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="description"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  style={{ borderRadius: "5px" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ borderRadius: "5px" }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : editingInventory ? (
                    "Update Inventory"
                  ) : (
                    "Add Inventory"
                  )}
                </Button>
              </div>
            </form>
          </DrawerContent>
        </Drawer>
      </div>
      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap items-end gap-4 mb-4 p-3">
        {/* Category Filter */}
        <div className="flex flex-col gap-1 min-w-[180px]">
          <Label style={{ fontSize: "13px", fontWeight: 500 }}>Category</Label>
          <Select value={filterCategory} onValueChange={handleFilterCategory}>
            <SelectTrigger
              style={{
                fontSize: "13px",
                height: "36px",
                padding: "6px 10px",
                borderRadius: "4px",
              }}
            >
              <SelectValue placeholder="select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="mess_inventory">Mess Inventory</SelectItem>
              <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Purchase Date Filter */}
        <div className="flex flex-col gap-1 min-w-[180px]">
          <Label style={{ fontSize: "13px", fontWeight: 500 }}>
            Purchase Date{" "}
            <span style={{ fontSize: "12px", fontWeight: 400, color: "#888" }}>
              (optional)
            </span>
          </Label>
          <div className="flex items-center gap-1">
            <Input
              type="date"
              value={filterDate}
              onChange={handleFilterDate}
              style={{
                fontSize: "13px",
                height: "36px",
                padding: "6px 10px",
                borderRadius: "4px",
              }}
            />
            {filterDate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterDate("");
                  fetchFilteredInventory(filterCategory, "");
                }}
                style={{ height: "36px", padding: "0 8px" }}
              >
                ✕
              </Button>
            )}
          </div>
        </div>

        {/* Clear All */}
        {(filterCategory || filterDate) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearFilters}
            style={{
              height: "36px",
              fontSize: "12px",
              borderRadius: "4px",
              alignSelf: "flex-end",
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>
      {/* Inventory Table */}

      {!selectCategory ? (
        <div
          className="rounded-xl border border-border bg-card shadow-card animate-slide-up"
          style={{
            animationDelay: "100ms",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <LayoutGrid className="h-12 w-12 mb-2 opacity-20" />
            <p>No category selected</p>
            <p className="text-sm">
              Select at least one category to get started
            </p>
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl border border-border bg-card shadow-card animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          <Table>
            <TableHeader>
              <TableRow style={{ borderBottom: "0.5px solid #E2E8F0" }}>
                <TableHead
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#0F172A",
                    textAlign: "left",
                    verticalAlign: "middle",
                    padding: "14px 16px",
                  }}
                >
                  Item Type
                </TableHead>
                <TableHead
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#0F172A",
                    textAlign: "left",
                    verticalAlign: "middle",
                    padding: "14px 16px",
                  }}
                >
                  Category
                </TableHead>
                <TableHead
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#0F172A",
                    textAlign: "left",
                    verticalAlign: "middle",
                    padding: "14px 16px",
                  }}
                >
                  Supplier
                </TableHead>
                <TableHead
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#0F172A",
                    textAlign: "left",
                    verticalAlign: "middle",
                    padding: "14px 16px",
                  }}
                >
                  Condition
                </TableHead>
                <TableHead
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#0F172A",
                    textAlign: "left",
                    verticalAlign: "middle",
                    padding: "14px 16px",
                  }}
                >
                  Unit Price
                </TableHead>
                <TableHead
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#0F172A",
                    textAlign: "left",
                    verticalAlign: "middle",
                    padding: "14px 16px",
                  }}
                >
                  Qty
                </TableHead>
                <TableHead
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#0F172A",
                    textAlign: "left",
                    verticalAlign: "middle",
                    padding: "14px 16px",
                  }}
                >
                  Total Price
                </TableHead>
                <TableHead
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#0F172A",
                    textAlign: "right",
                    verticalAlign: "middle",
                    padding: "14px 16px",
                  }}
                >
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    {filterLoading ? (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#888",
                          alignSelf: "flex-end",
                          paddingBottom: "8px",
                        }}
                      >
                        Loading...
                      </p>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Package className="h-12 w-12 mb-2 opacity-20" />
                        <p>No inventory items found</p>
                        <p className="text-sm">Add a new item to get started</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow
                    key={item._id}
                    style={{
                      height: "44px",
                      borderBottom: "0.5px solid #F1F5F9",
                    }}
                  >
                    <TableCell
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#111827",
                        textAlign: "left",
                        verticalAlign: "middle",
                        padding: "10px 16px",
                      }}
                    >
                      {item.itemType || item.messItem
                        ? (item.itemType || item.messItem)
                            .charAt(0)
                            .toUpperCase() +
                          (item.itemType || item.messItem).slice(1)
                        : "-"}
                    </TableCell>
                    <TableCell
                      style={{
                        fontSize: "12px",
                        fontWeight: 400,
                        color: "#374151",
                        textAlign: "left",
                        verticalAlign: "middle",
                        padding: "10px 16px",
                      }}
                    >
                      {item.category
                        ? item.category.charAt(0).toUpperCase() +
                          item.category.slice(1)
                        : "-"}
                    </TableCell>
                    <TableCell
                      style={{
                        fontSize: "12px",
                        fontWeight: 400,
                        color: "#374151",
                        textAlign: "left",
                        verticalAlign: "middle",
                        padding: "10px 16px",
                      }}
                    >
                      {item.supplier || "-"}
                    </TableCell>
                    <TableCell
                      style={{
                        fontSize: "12px",
                        fontWeight: 400,
                        color: "#374151",
                        textAlign: "left",
                        verticalAlign: "middle",
                        padding: "10px 16px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: 500,
                          backgroundColor:
                            item.condition === "new"
                              ? "#DCFCE7"
                              : item.condition === "used"
                                ? "#FEF9C3"
                                : "#F1F5F9",
                          color:
                            item.condition === "new"
                              ? "#16A34A"
                              : item.condition === "used"
                                ? "#CA8A04"
                                : "#64748B",
                        }}
                      >
                        {item.condition
                          ? item.condition.charAt(0).toUpperCase() +
                            item.condition.slice(1)
                          : "-"}
                      </span>
                    </TableCell>
                    <TableCell
                      style={{
                        fontSize: "12px",
                        fontWeight: 400,
                        color: "#374151",
                        textAlign: "left",
                        verticalAlign: "middle",
                        padding: "10px 16px",
                      }}
                    >
                      Rs. {item.unitPrice?.toLocaleString() ?? "-"}
                    </TableCell>
                    <TableCell
                      style={{
                        fontSize: "12px",
                        fontWeight: 400,
                        color: "#374151",
                        textAlign: "left",
                        verticalAlign: "middle",
                        padding: "10px 16px",
                      }}
                    >
                      {item.quantity ?? "-"}
                      {item.unit ? ` ${item.unit}` : ""}
                    </TableCell>
                    <TableCell
                      style={{
                        fontSize: "12px",
                        fontWeight: 400,
                        color: "#374151",
                        textAlign: "left",
                        verticalAlign: "middle",
                        padding: "10px 16px",
                      }}
                    >
                      Rs. {item.totalPrice?.toLocaleString() ?? "-"}
                    </TableCell>
                    <TableCell
                      style={{
                        textAlign: "right",
                        verticalAlign: "middle",
                        padding: "10px 16px",
                      }}
                    >
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => handleMenuClick(e, item._id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                          }}
                        >
                          <MoreVertical
                            style={{
                              width: "16px",
                              height: "16px",
                              color: "#94A3B8",
                            }}
                          />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {/* Fixed Position Dropdown Menu */}
      {openMenuId && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setOpenMenuId(null)}
            style={{ background: "transparent" }}
          />
          <div
            className="fixed z-[9999]"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              backgroundColor: "#FFFFFF",
              borderRadius: "7px",
              border: "0.5px solid #E2E8F0",
              padding: "4px",
              minWidth: "130px",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            <button
              onClick={() => {
                const inventoryItem = filteredItems.find(
                  (s) => (s._id || s.id) === openMenuId,
                );
                if (inventoryItem) handleView(inventoryItem);
                setOpenMenuId(null);
              }}
              className="w-full flex items-center gap-2 transition-colors"
              style={{
                height: "32px",
                padding: "0 10px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: 400,
                color: "#374151",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#F8FAFC")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Eye
                style={{ width: "14px", height: "14px", color: "#64748B" }}
              />
              View
            </button>
            <button
              onClick={() => {
                const inventoryItem = filteredItems.find(
                  (s) => (s._id || s.id) === openMenuId,
                );
                if (inventoryItem) handleEdit(inventoryItem);
                setOpenMenuId(null);
              }}
              className="w-full flex items-center gap-2 transition-colors"
              style={{
                height: "32px",
                padding: "0 10px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: 400,
                color: "#374151",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#F8FAFC")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Edit
                style={{ width: "14px", height: "14px", color: "#64748B" }}
              />
              Edit
            </button>
            <div
              style={{
                height: "0.5px",
                backgroundColor: "#F1F5F9",
                margin: "2px 0",
              }}
            />
            <button
              onClick={() => {
                handleDelete(openMenuId);
                setOpenMenuId(null);
              }}
              className="w-full flex items-center gap-2 transition-colors"
              style={{
                height: "32px",
                padding: "0 10px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: 400,
                color: "#EF4444",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#FEF2F2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Trash2
                style={{ width: "14px", height: "14px", color: "#EF4444" }}
              />
              Delete
            </button>
          </div>
        </>
      )}

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              inventoryItem Details
            </DialogTitle>
          </DialogHeader>
          {viewingInventory && (
            <div className="mt-4 grid gap-6 md:grid-cols-3 lg:grid-cols-4">
              <div>
                <Label className="text-muted-foreground">Supplier Name</Label>
                <p className="mt-1 font-medium">{viewingInventory.supplier}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  Supplier Location
                </Label>
                <p className="mt-1 font-medium">{viewingInventory.location}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Category</Label>
                <p className="mt-1 font-medium">{viewingInventory.category}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Condition</Label>
                <p className="mt-1 font-medium">{viewingInventory.condition}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Quantity</Label>
                <p className="mt-1 font-medium">{viewingInventory.quantity}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Unit Price</Label>
                <p className="mt-1 font-medium">{viewingInventory.unitPrice}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Discount</Label>
                <p className="mt-1 font-medium">{viewingInventory.discount}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Total Price</Label>
                <p className="mt-1 font-medium">
                  {viewingInventory.totalPrice}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Purchase Date</Label>
                <p className="mt-1 font-medium">
                  {viewingInventory.purchase_date.slice(0, 10)}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1 font-medium">
                  {viewingInventory.description}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Inventory;
