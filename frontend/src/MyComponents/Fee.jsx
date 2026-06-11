import MainLayout from "@/components/layout/MainLayout";
import React, { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { DollarSign, MoreVertical, Users } from "lucide-react";
import BoardingFeeForm from "./BoardingFeeForm";

import { useHostel } from "@/context/useHostel";
const Fee = () => {
  const { challans } = useHostel();
  // console.log("Finance Page Challans",challans)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <MainLayout>
      <div className="mb-8 animate-fade-in flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Fee Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track and manage your fees
          </p>
        </div>
        <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DrawerTrigger asChild>
            <Button
              style={{
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 400,
                padding: "6px 14px",
                height: "34px",
                flexShrink: 0,
              }}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Create Challan
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle style={{ fontSize: "18px", fontWeight: 600 }}>
                Create Boarding Fee Challan
              </DrawerTitle>
            </DrawerHeader>
            <BoardingFeeForm />
          </DrawerContent>
        </Drawer>
      </div>
      {/* Challans Table */}
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
                Name
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
                Fee Month
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
                Total
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
                Paid
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
                Due
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
            {challans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="h-12 w-12 mb-2 opacity-20" />
                    <p>No challans found</p>
                    <p className="text-sm">Add a new challan to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              challans.map((challan) => (
                <TableRow
                  key={challan._id}
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
                    {challan.boarderName || "-"}
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
                    {challan.feeMonth} {challan.feeYear}
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
                    Rs. {challan.totalAmount?.toLocaleString() ?? "-"}
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
                    Rs. {challan.receivedAmount?.toLocaleString() ?? "-"}
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
                    Rs. {challan.balanceAmount?.toLocaleString() ?? "-"}
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
                        onClick={(e) => handleMenuClick(e, challan._id)}
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
    </MainLayout>
  );
};

export default Fee;
