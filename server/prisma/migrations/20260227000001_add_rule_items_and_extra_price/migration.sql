-- Add extraItemPrice to PackageCategoryRule
ALTER TABLE "PackageCategoryRule" ADD COLUMN "extraItemPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Create PackageCategoryRuleItem table
CREATE TABLE "PackageCategoryRuleItem" (
    "id" SERIAL NOT NULL,
    "ruleId" INTEGER NOT NULL,
    "menuItemId" INTEGER NOT NULL,
    CONSTRAINT "PackageCategoryRuleItem_pkey" PRIMARY KEY ("id")
);

-- Unique constraint: one item can only appear once per rule
CREATE UNIQUE INDEX "PackageCategoryRuleItem_ruleId_menuItemId_key" ON "PackageCategoryRuleItem"("ruleId", "menuItemId");

-- Foreign keys
ALTER TABLE "PackageCategoryRuleItem" ADD CONSTRAINT "PackageCategoryRuleItem_ruleId_fkey"
    FOREIGN KEY ("ruleId") REFERENCES "PackageCategoryRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PackageCategoryRuleItem" ADD CONSTRAINT "PackageCategoryRuleItem_menuItemId_fkey"
    FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
